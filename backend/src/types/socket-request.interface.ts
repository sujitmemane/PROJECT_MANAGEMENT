import type { Socket } from "socket.io";
import type { UserDocument } from "./user.interface";

export interface SocketRequestInterface extends Socket {
  user?: UserDocument;
}
