numbers = [2, 7, 11, 15]
target = 9

# Yêu cầu: Tìm hai số trong danh sách numbers sao cho tổng của chúng bằng target 
left = 0
right = len(numbers) - 1 
while left < right:
    current_sum = numbers[left] + numbers[right]

    if current_sum == target:
        print(left, right)
        break # Dừng lại 

    elif current_sum < target:
        left += 1

    else: 
        right -= 1 

