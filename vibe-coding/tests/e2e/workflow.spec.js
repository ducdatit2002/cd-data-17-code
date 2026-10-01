import { test, expect } from "@playwright/test";
async function login(page, role = "Admin") {
  await page.goto("/");
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Chào/ })).toBeVisible();
}
test("desktop end-to-end HR workflow persists posts, profile, score, ranking and interview", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);
  await page.getByRole("button", { name: "Tạo vị trí", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Tên vị trí *", { exact: true })
    .fill("QA Engineer E2E");
  await dialog
    .getByLabel("Mô tả công việc *", { exact: true })
    .fill("Build reliable automated quality assurance for web products.");
  await dialog
    .getByLabel("Yêu cầu bắt buộc", { exact: true })
    .fill("Playwright");
  await dialog.getByRole("button", { name: "Lưu vị trí", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("button", { name: "Bài tuyển dụng", exact: true })
    .click();
  await page
    .getByLabel("Chọn vị trí tuyển dụng")
    .selectOption({ label: "QA Engineer E2E" });
  await page
    .getByRole("button", { name: "Dùng mẫu từ JD", exact: true })
    .click();
  await expect(page.getByLabel("Nội dung bài tuyển dụng")).toHaveValue(
    /QA Engineer E2E/,
  );
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Lịch sử (1)", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Ứng viên/, exact: false })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Nhập thủ công", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Họ tên *", { exact: true }).fill("Ứng viên E2E");
  await dialog.getByLabel("Email", { exact: true }).fill("e2e@example.com");
  await dialog.getByLabel("Kỹ năng", { exact: true }).fill("Playwright");
  await dialog
    .getByLabel("Nội dung CV *", { exact: true })
    .fill(
      "Ứng viên E2E\ne2e@example.com\nPlaywright\n3 years of testing experience.",
    );
  await dialog
    .getByRole("button", { name: "Lưu ứng viên", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Ứng viên E2E", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Chấm thủ công", exact: true })
    .click();
  const scores = dialog.getByLabel("Điểm (0–100)", { exact: true });
  for (let i = 0; i < 5; i++) await scores.nth(i).fill("80");
  await dialog
    .getByLabel("Lý do chấm / điều chỉnh điểm *", { exact: true })
    .fill("Đã xác minh kinh nghiệm kiểm thử.");
  await dialog
    .getByRole("button", { name: "Lưu đánh giá · 80/100", exact: true })
    .click();
  await expect(
    dialog.getByText("Đánh giá bởi HR", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "CV Ranking", exact: false }).click();
  await page
    .getByLabel("Chọn vị trí tuyển dụng")
    .selectOption({ label: "QA Engineer E2E" });
  await expect(
    page.getByRole("button", { name: "Ứng viên E2E", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Shortlist Ứng viên E2E", exact: true })
    .click();
  await expect(
    page.getByText("Đã thêm vào shortlist", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Phone interview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lên lịch phỏng vấn", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  const option = await dialog
    .getByLabel("Ứng viên & vị trí")
    .locator("option")
    .filter({ hasText: "Ứng viên E2E" })
    .getAttribute("value");
  await dialog.getByLabel("Ứng viên & vị trí").selectOption(option);
  await dialog
    .getByRole("button", { name: "Lưu lịch phỏng vấn", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await page
    .locator(".interview-select")
    .filter({ hasText: "Ứng viên E2E" })
    .click();
  await page
    .getByLabel("Câu trả lời 1", { exact: true })
    .fill("Ứng viên có kinh nghiệm Playwright cho ứng dụng web.");
  await page
    .getByLabel("Ghi chú hoặc transcript", { exact: true })
    .fill("Mong muốn làm việc với đội sản phẩm.");
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await expect(
    page.getByText("Đã lưu phỏng vấn", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Duyệt kết quả", exact: true })
    .click();
  await expect(
    page.getByText("Đã duyệt kết quả phỏng vấn", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Phone interview", exact: true })
    .click();
  await page
    .locator(".interview-select")
    .filter({ hasText: "Ứng viên E2E" })
    .click();
  await expect(
    page.getByLabel("Ghi chú hoặc transcript", { exact: true }),
  ).toHaveValue("Mong muốn làm việc với đội sản phẩm.");
  await expect(
    page.locator(".interview-context").getByText("Đã duyệt", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("ranking comparison shows consistent rubric and evidence", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "CV Ranking", exact: false }).click();
  await page
    .getByLabel("Chọn vị trí tuyển dụng")
    .selectOption({ label: "Senior Frontend Developer" });
  await page.getByLabel("So sánh Nguyễn Minh Khang", { exact: true }).check();
  await page.getByLabel("So sánh Trần Ngọc Anh", { exact: true }).check();
  await page
    .getByRole("button", { name: "So sánh (2/4)", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByText("Kỹ năng chuyên môn (35%)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText("Điểm tổng", { exact: true }),
  ).toBeVisible();
});
test("manager UI permits comments and hides hiring mutations", async ({
  page,
}) => {
  await login(page, "Hiring Manager");
  await expect(
    page.getByRole("button", { name: "Tạo vị trí", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: /Ứng viên/, exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Tải CV lên", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Trần Ngọc Anh", { exact: true })).toBeVisible();
  await expect(page.getByText("Vũ Hải Yến", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Trần Ngọc Anh", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Điều chỉnh điểm", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Nhận xét", exact: true }).click();
  await page
    .getByLabel("Nhận xét cho đội tuyển dụng", { exact: true })
    .fill("Cần xác minh kinh nghiệm dự án.");
  await page.getByRole("button", { name: "Lưu nhận xét", exact: true }).click();
  await expect(
    page.getByText("Cần xác minh kinh nghiệm dự án.", { exact: true }),
  ).toBeVisible();
});
test("mobile layout has usable navigation and no document overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Bài tuyển dụng", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bài tuyển dụng", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});
