#!/usr/bin/env python3
"""
Event Tracker Project Runner
Automated setup and launch script for the Event Tracker application.
"""

import os
import sys
import subprocess
import platform
import time

def run_command(command, cwd=None, shell=True):
    """Execute a command and return the result."""
    try:
        result = subprocess.run(command, cwd=cwd, shell=shell, check=True, 
                              capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python():
    """Check if Python is available."""
    success, _ = run_command([sys.executable, "--version"])
    return success

def check_node():
    """Check if Node.js is available."""
    success, _ = run_command(["node", "--version"])
    return success

def setup_backend():
    """Setup Django backend."""
    print("🐍 Setting up Django backend...")
    
    backend_dir = os.path.join(os.getcwd(), "backend")
    venv_dir = os.path.join(backend_dir, "venv")
    
    # Check if virtual environment exists
    if not os.path.exists(venv_dir):
        print("📦 Creating virtual environment...")
        success, output = run_command([sys.executable, "-m", "venv", "venv"], cwd=backend_dir)
        if not success:
            print(f"❌ Failed to create virtual environment: {output}")
            return False
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation script path
    if platform.system() == "Windows":
        activate_script = os.path.join(venv_dir, "Scripts", "activate.bat")
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe")
    else:
        activate_script = os.path.join(venv_dir, "bin", "activate")
        python_exe = os.path.join(venv_dir, "bin", "python")
        pip_exe = os.path.join(venv_dir, "bin", "pip")
    
    # Install requirements
    print("📦 Installing Python dependencies...")
    success, output = run_command([pip_exe, "install", "-r", "requirements.txt"], cwd=backend_dir)
    if not success:
        print(f"❌ Failed to install requirements: {output}")
        return False
    print("✅ Dependencies installed")
    
    # Run migrations
    print("🗄️ Running database migrations...")
    success, output = run_command([python_exe, "manage.py", "migrate"], cwd=backend_dir)
    if not success:
        print(f"❌ Failed to run migrations: {output}")
        return False
    print("✅ Database migrations completed")
    
    # # Collect static files
    # print("📁 Collecting static files...")
    # success, output = run_command([python_exe, "manage.py", "collectstatic", "--noinput"], cwd=backend_dir)
    # if not success:
    #     print(f"⚠️ Static files collection failed (this is usually OK): {output}")
    # else:
    #     print("✅ Static files collected")
    
    return True, python_exe

def setup_frontend():
    """Setup React frontend."""
    print("⚛️ Setting up React frontend...")
    
    frontend_dir = os.path.join(os.getcwd(), "frontend", "event-tracker-ui")
    
    if not os.path.exists(frontend_dir):
        print("❌ Frontend directory not found")
        return False
    
    # Install npm dependencies
    print("📦 Installing npm dependencies...")
    success, output = run_command(["npm", "install"], cwd=frontend_dir)
    if not success:
        print(f"❌ Failed to install npm dependencies: {output}")
        return False
    print("✅ npm dependencies installed")
    
    return True

def open_backend_terminal(python_exe):
    """Open new terminal for Django server."""
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    if platform.system() == "Windows":
        # Windows - open new cmd window
        cmd = f'start cmd /k "cd /d {backend_dir} && {python_exe} manage.py runserver"'
        subprocess.run(cmd, shell=True)
    else:
        # macOS/Linux - try different terminal emulators
        terminals = [
            ['gnome-terminal', '--', 'bash', '-c', f'cd {backend_dir} && {python_exe} manage.py runserver; exec bash'],
            ['xterm', '-e', f'cd {backend_dir} && {python_exe} manage.py runserver; exec bash'],
            ['osascript', '-e', f'tell app "Terminal" to do script "cd {backend_dir} && {python_exe} manage.py runserver"']
        ]
        
        for terminal_cmd in terminals:
            try:
                subprocess.Popen(terminal_cmd)
                break
            except FileNotFoundError:
                continue

def open_frontend_terminal():
    """Open new terminal for React server."""
    frontend_dir = os.path.join(os.getcwd(), "frontend", "event-tracker-ui")
    
    if platform.system() == "Windows":
        # Windows - open new cmd window
        cmd = f'start cmd /k "cd /d {frontend_dir} && npm run dev"'
        subprocess.run(cmd, shell=True)
    else:
        # macOS/Linux - try different terminal emulators
        terminals = [
            ['gnome-terminal', '--', 'bash', '-c', f'cd {frontend_dir} && npm run dev; exec bash'],
            ['xterm', '-e', f'cd {frontend_dir} && npm run dev; exec bash'],
            ['osascript', '-e', f'tell app "Terminal" to do script "cd {frontend_dir} && npm run dev"']
        ]
        
        for terminal_cmd in terminals:
            try:
                subprocess.Popen(terminal_cmd)
                break
            except FileNotFoundError:
                continue

def main():
    """Main function to orchestrate the setup and launch."""
    print("🚀 Event Tracker Project Runner")
    print("=" * 40)
    
    # Check prerequisites
    print("🔍 Checking prerequisites...")
    
    if not check_python():
        print("❌ Python not found. Please install Python 3.8+")
        sys.exit(1)
    print("✅ Python found")
    
    if not check_node():
        print("❌ Node.js not found. Please install Node.js 16+")
        sys.exit(1)
    print("✅ Node.js found")
    
    # Setup backend
    backend_result = setup_backend()
    if isinstance(backend_result, tuple):
        backend_success, python_exe = backend_result
    else:
        backend_success = backend_result
        python_exe = sys.executable
    
    if not backend_success:
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("=" * 40)
    
    # Open terminals for servers
    print("🚀 Opening terminals for servers...")
    
    print("🐍 Opening Django server terminal...")
    open_backend_terminal(python_exe)
    
    # Wait a moment before starting frontend
    time.sleep(2)
    
    print("⚛️ Opening React server terminal...")
    open_frontend_terminal()
    
    print("\n🌐 Application URLs:")
    print("   Frontend: http://localhost:5000 (or check Vite output)")
    print("   Backend:  http://localhost:8000")
    print("   Admin:    http://localhost:8000/admin")
    
    print("\n📝 Next steps:")
    print("   1. Check the opened terminal windows")
    print("   2. Wait for both servers to start")
    print("   3. Open your browser to the frontend URL")
    print("   4. Register a new account or login")
    print("   5. Start creating events!")
    
    print("\n✅ Terminals opened successfully!")
    print("⚠️ Close the terminal windows to stop the servers")

if __name__ == "__main__":
    main()