danh_sach = ["An", "Bình", "Chi", "Dũng", "Lan"]

# Cách 1: lấy phần tử
for ten in danh_sach:
    print(ten)

# Cách 2: lấy vị trí
for j in range(len(danh_sach)):
    print(j)

# Cách 3: lấy cả vị trí và phần tử 
for i, ten in enumerate(danh_sach):
    print(i, ten)