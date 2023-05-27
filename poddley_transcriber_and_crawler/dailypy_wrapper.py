import subprocess
from time import sleep
import subprocess as sp

# Path and name to the script you are trying to start
file_path = "daily.py" 
restart_timer = 360

def start_script():
    try:
        print("Starting script")
        sub1 = subprocess.Popen(["python3", "./daily.py"])
        sub1.wait()
        handle_crash()
    except:
        handle_crash()
    finally:
        handle_crash()
def handle_crash():
    print("=====>Script crashed/finished, restarting in", restart_timer)
    sleep(restart_timer)  # Restarts the script after 10 seconds
    start_script()

start_script()
