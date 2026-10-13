from PIL import Image
import numpy as np


def hismat(source_image, reference_image):
    # แปลงภาพเป็น NumPy Array
    source = np.array(source_image)
    reference = np.array(reference_image)

    # สร้าง Array สำหรับเก็บภาพผลลัพธ์
    matched = np.zeros_like(source)

    # ทำ Histogram Matching แยกทีละ Channel
    for channel in range(3):

        # -----------------------------
        # 1. ดึงข้อมูลแต่ละ Channel
        # -----------------------------

        source_channel = source[:, :, channel]
        reference_channel = reference[:, :, channel]

        # -----------------------------
        # 2. สร้าง Histogram
        # -----------------------------

        source_hist = np.bincount(
            source_channel.ravel(),
            minlength=256
        )

        reference_hist = np.bincount(
            reference_channel.ravel(),
            minlength=256
        )

        # -----------------------------
        # 3. คำนวณ CDF
        # -----------------------------

        source_cdf = np.cumsum(source_hist)
        reference_cdf = np.cumsum(reference_hist)

        # ทำให้ CDF อยู่ในช่วง 0-1
        source_cdf = source_cdf / source_cdf[-1]
        reference_cdf = reference_cdf / reference_cdf[-1]

        # -----------------------------
        # 4. สร้าง Mapping
        # -----------------------------

        mapping = np.zeros(256, dtype=np.uint8)

        for source_value in range(256):

            difference = np.abs(
                reference_cdf - source_cdf[source_value]
            )

            reference_value = np.argmin(difference)

            mapping[source_value] = reference_value

        # -----------------------------
        # 5. เปลี่ยนค่า Pixel
        # -----------------------------

        matched[:, :, channel] = mapping[source_channel]

    # แปลงกลับเป็น PIL Image
    return Image.fromarray(matched)