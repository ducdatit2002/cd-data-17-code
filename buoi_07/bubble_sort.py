
# Nhiệm vụ: sắp xếp theo từ nhỏ đến lớn [1, 2, 3, 4, 5, 6, 7, 8]
# -> Bubble Sort: Sắp xếp nổi bọt 
# -> Các hoạt động: 8 4 -> đổi chỗ thành -> 4 8 
# 4 8 5 -> 4 5 3 2 6 7 1 8 
# -> 4 3 2 5 6 1 7 8
# -> 3 2 4 5 1 6 7 8
# -> 2 3 4 1 5 6 7 8 
# -> 2 3 1 4 5 6 7 8
# -> 2 1 3 4 5 6 7 8
# -> 1 2 3 4 5 6 7 8 

# Vị trí j -> numbers[j]  
# Vị trí liền sau: j + 1 -> numbers[j+1]

# if number[j] > number[j+1]:
#     numbers[j], numbers[j+1] = number[j+1], number[j]
# 8 4 -> 4 8 

# for i in range(len(numbers)):
#     for j in range(0, len(numbers) - i - 1): 
#         # len(numbers) - i - 1 -> len: số phần tử; -1 để tránh lấy j+1 vượt khỏ phần tử; -i để bỏ những phần tử cuối đã được sắp xếp 
#         if numbers[j] > numbers[j+1]:
#             numbers[j], numbers[j+1] = numbers[j+1], numbers[j]


def bubble_sort(numbers):
    n = len(numbers)
    for i in range(n):
        for j in range(0, n - i - 1):
            if numbers[j] < numbers[j+1]:
                numbers[j], numbers[j+1] = numbers[j+1], numbers[j]
    return numbers
numbers = [8, 4, 5, 3, 2, 6, 7, 1]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)


data = [
    [1, 4, "Desktop", 1, 15, 2, 3],
    [2, 2, "Mobile", 1, 20, 5, 1],
    [3, 1, "Desktop", 1, 12, 4, 2]
]
# data[j][6] -> data[j][column]
# data[j+1][6] -> data[j+1][column]

# Chuyển Bubble Sort thành hàm sắp xếp bảng 
def bubble_sort_table(data, column):
    n = len(data)
    for i in range(n):
        for j in range(0, n - i - 1):
            if data[j][column] > data[j+1][column]:
                data[j], data[j+1] = data[j+1], data[j]
    return data
bubble_sort_table(data, 6)
print(bubble_sort_table(data, 6))