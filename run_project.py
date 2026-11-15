import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 65)
    print("  FinPilot MAX: AI-Powered Intelligent Personal Finance Advisor")
    print("=" * 65)
    print("\n[1/2] Starting FastAPI Backend on http://localhost:8005 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "backend/run.py"],
        cwd=root_dir
    )

    print("\n[2/2] Starting React Vite Frontend on http://localhost:7000 ...")
    frontend_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [frontend_cmd, "run", "dev", "--", "--port", "7000"],
        cwd=frontend_dir
    )

    print("\n" + "=" * 65)
    print("  🚀 FinPilot MAX is running successfully!")
    print("  🌐 Frontend Dashboard: http://localhost:7000")
    print("  📖 Backend API Docs:   http://localhost:8005/docs")
    print("=" * 65)
    print("  Press Ctrl+C to terminate both servers...\n")

    try:
        while True:
            time.sleep(2)
            if backend_proc.poll() is not None:
                print("Backend server stopped. Restarting...")
                backend_proc = subprocess.Popen([sys.executable, "backend/run.py"], cwd=root_dir)
            if frontend_proc.poll() is not None:
                print("Frontend dev server stopped. Restarting...")
                frontend_proc = subprocess.Popen([frontend_cmd, "run", "dev", "--", "--port", "7000"], cwd=frontend_dir)
    except KeyboardInterrupt:
        print("\nStopping FinPilot MAX services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
