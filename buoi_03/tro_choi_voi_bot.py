# MINIGAME
# User nhập số từ 1 đến 3 
# Bot random số từ 1 đến 3
# Nếu số của user lớn hơn bot thì user thắng
# Nếu chưa thắng thì chơi tiếp 
# Không biết trước phải chơi bao nhiêu lần

import random

while True:
    user = int(input("Nhập số từ 1 đến 3: "))
    bot = random.randint(1,3)

    print("User: ", user)
    print("Bot: ", bot)

    if user > bot:
        print("Bạn đã thắng")
        break # dừng vòng lặp hiện tại ngay lập tức
    else:
        print("Bạn thua rồi")
