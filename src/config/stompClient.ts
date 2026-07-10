import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { store } from "../app/store";
import { ENV } from "./env";

/**
 * Singleton wrapper quanh @stomp/stompjs.
 * Chỉ mở 1 kết nối WS duy nhất cho toàn app (message + notification cùng dùng chung),
 * tự lấy accessToken từ Redux store giống cách axiosClient đang làm.
 *
 * Cách dùng:
 *   stompClient.connect();
 *   const sub = stompClient.subscribe('/user/queue/messages', (body) => {...});
 *   sub.unsubscribe();
 *   stompClient.disconnect();
 */
type ConnectionListener = (connected: boolean) => void;

class StompClientManager {
  private client: Client | null = null;
  private connected = false;
  private connectionListeners = new Set<ConnectionListener>();
  // Lưu lại subscription theo destination để tránh subscribe trùng
  // (giống subscribedConvsRef trong bản test) và để re-subscribe khi reconnect.
  private subscriptions = new Map<string, StompSubscription>();
  private pendingHandlers = new Map<string, (body: unknown) => void>();

  private notifyConnectionChange(connected: boolean) {
    this.connected = connected;
    this.connectionListeners.forEach((cb) => cb(connected));
  }

  onConnectionChange(cb: ConnectionListener) {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  isConnected() {
    return this.connected;
  }

  /**
   * Mọi StompSubscription đang giữ đều gắn với connection HIỆN TẠI.
   * Khi connection chết (disconnect / websocket close / tạo client mới),
   * các subscription cũ này coi như đã chết theo — phải xoá khỏi map để
   * lần connect/reconnect kế tiếp thực sự gọi lại doSubscribe() cho từng
   * destination, thay vì bị guard "đã subscribe rồi" chặn lại một cách sai lệch.
   */
  private invalidateStaleSubscriptions() {
    this.subscriptions.clear();
  }

  connect() {
    if (this.client?.active) return;

    const token = store.getState().auth.accessToken;
    if (!token) return;

    // Client cũ (nếu có) sắp bị thay bằng client mới -> mọi subscription cũ
    // đã vô hiệu, xoá để lần connect này subscribe lại từ đầu.
    this.invalidateStaleSubscriptions();

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${ENV.WS_URL}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        this.notifyConnectionChange(true);
        // Re-subscribe toàn bộ destination đã đăng ký trước đó (phòng trường hợp reconnect)
        this.pendingHandlers.forEach((handler, destination) => {
          this.doSubscribe(destination, handler);
        });
      },
      onDisconnect: () => {
        this.notifyConnectionChange(false);
        // Subscription cũ đã chết theo connection này -> xoá để reconnect sau
        // subscribe lại thật sự (không bị guard "already subscribed" chặn sai).
        this.invalidateStaleSubscriptions();
      },
      onWebSocketClose: () => {
        this.notifyConnectionChange(false);
        this.invalidateStaleSubscriptions();
      },
      onStompError: (frame) => {
        console.error("[STOMP] error:", frame.headers?.message, frame.body);
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.pendingHandlers.clear();
    this.client?.deactivate();
    this.client = null;
    this.notifyConnectionChange(false);
  }

  private doSubscribe(destination: string, handler: (body: unknown) => void) {
    if (!this.client?.connected) return;
    if (this.subscriptions.has(destination)) return;

    const sub = this.client.subscribe(destination, (frame: IMessage) => {
      try {
        handler(JSON.parse(frame.body));
      } catch (e) {
        console.error(`[STOMP] parse error @ ${destination}:`, e);
      }
    });
    this.subscriptions.set(destination, sub);
  }

  /**
   * Subscribe 1 destination. Nếu client chưa connected, handler sẽ được lưu lại
   * và tự subscribe khi onConnect bắn ra (hoặc khi reconnect).
   */
  subscribe(destination: string, handler: (body: unknown) => void) {
    this.pendingHandlers.set(destination, handler);
    if (this.client?.connected) {
      this.doSubscribe(destination, handler);
    }
    return () => this.unsubscribe(destination);
  }

  unsubscribe(destination: string) {
    this.subscriptions.get(destination)?.unsubscribe();
    this.subscriptions.delete(destination);
    this.pendingHandlers.delete(destination);
  }
}

export const stompClient = new StompClientManager();
