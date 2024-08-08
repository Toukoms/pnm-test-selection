import re

pattern = r'^(?:[0-9]{3})-(FRS|CUL|LOG)-(?:([1-9]|10)[A-Da-d](?:, ?([1-9]|10)[A-Da-d]){0,9})?,?$'

nb_msg = int(input())
valid_msg:list[str] = []
invalid_msg:list[str] = []
for msg in range(nb_msg):
    message = input()
    if re.match(pattern, message):
        valid_msg.append(message)
    else:
        invalid_msg.append(message)

with open('/data/valid-data.txt', 'w') as f:
    for msg in valid_msg:
        f_msg = "".join(char for char in msg if char.isalnum())
        f.write(f_msg.upper()+"\n")

with open('/data/invalid-data.txt', 'w') as f:
    for msg in invalid_msg:
        f.write(msg+"\n")
