import socket
import threading

def handle(buffer, direction, src, dst):
    src_address, src_port = src.getsockname()
    dst_address, dst_port = dst.getpeername()
    while True:
        try:
            data = src.recv(buffer)
            if len(data) == 0:
                break
            dst.send(data)
        except:
            break
    src.close()
    dst.close()

def forward(src, port):
    try:
        dst = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        dst.connect(('127.0.0.1', port))
        
        t1 = threading.Thread(target=handle, args=(4096, 'src', src, dst))
        t2 = threading.Thread(target=handle, args=(4096, 'dst', dst, src))
        t1.start()
        t2.start()
    except Exception as e:
        print(f"Failed to connect to target: {e}")
        src.close()

def server(local_port, remote_port):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('0.0.0.0', local_port))
    server_socket.listen(5)
    print(f"Listening on 0.0.0.0:{local_port} forwarding to 127.0.0.1:{remote_port}...")

    while True:
        src, addr = server_socket.accept()
        print(f"Connection from {addr}")
        threading.Thread(target=forward, args=(src, remote_port)).start()

if __name__ == '__main__':
    server(3308, 3306)
