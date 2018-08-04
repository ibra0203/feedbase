import socketIOClient from 'socket.io-client';
import '../clientSession';
export const socket = socketIOClient({transports: ['websocket'], upgrade: false});
