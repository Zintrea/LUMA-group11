-- 1. ทดสอบเพิ่มข้อมูลผู้ใช้ (INSERT)
INSERT INTO users (username, email, password_hash)
VALUES 
    ('somchai_ai', 'somchai@email.com', 'hashed_pass_1234'),
    ('sri_test', 'sri@email.com', 'hashed_pass_5678');

-- 2. ทดสอบเพิ่มข้อมูลคิวงาน (INSERT)
INSERT INTO image_tasks (user_id, task_type, status, prompt_text, input_image_path)
VALUES 
    (1, 'generate', 'pending', 'แมวอวกาศสีชมพู', NULL),
    (2, 'remove_bg', 'processing', NULL, '/inputs/test_pic.jpg');

-- 3. ทดสอบดึงข้อมูลมาดูผลลัพธ์ (SELECT)
-- ดึงข้อมูลผู้ใช้ทั้งหมด
SELECT * FROM users;

-- ดึงข้อมูลคิวงานทั้งหมด
SELECT * FROM image_tasks;

-- ดึงข้อมูลงานที่ยัง pending อยู่ (จำลองการทำงานของ AI ที่ต้องมาค้นหางาน)
SELECT * FROM image_tasks WHERE status = 'pending';