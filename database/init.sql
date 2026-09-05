-- ลบตารางและประเภทข้อมูลเก่าทิ้ง (หากมี) เพื่อให้รันไฟล์นี้ซ้ำได้โดยไม่ Error
DROP TABLE IF EXISTS image_tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS task_type_enum;
DROP TYPE IF EXISTS task_status_enum;

-- 1. สร้าง Enum สำหรับประเภทงานและสถานะ
CREATE TYPE task_type_enum AS ENUM ('generate', 'remove_bg', 'enhance');
CREATE TYPE task_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');

-- 2. สร้างตาราง users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. สร้างตาราง image_tasks
CREATE TABLE image_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_type task_type_enum NOT NULL,
    status task_status_enum DEFAULT 'pending',
    prompt_text TEXT, 
    input_image_path TEXT, 
    output_image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. สร้าง Trigger เพื่ออัปเดต updated_at อัตโนมัติเวลาข้อมูลมีการเปลี่ยนแปลง
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$ BEGIN     NEW.updated_at = now();     RETURN NEW; END; $$ language 'plpgsql';

CREATE TRIGGER update_image_tasks_modtime
BEFORE UPDATE ON image_tasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();