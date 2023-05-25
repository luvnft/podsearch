import sys
from audioOffsetFinder import find_offset_between_files

def calculate(podcastAudio, videoAudio):
  results = find_offset_between_files(podcastAudio, videoAudio, trim=2000)
  print(str(results["time_offset"]))

if __name__ == "__main__":
  podcastAudio = sys.argv[1]
  videoAudio = sys.argv[2]
  calculate(podcastAudio=podcastAudio, videoAudio=videoAudio)
