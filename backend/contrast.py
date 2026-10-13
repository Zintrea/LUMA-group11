import cv2


def process_grayscale_image(image):
    """
    แปลงภาพสีเป็น Grayscale
    และปรับ Contrast ด้วย Histogram Equalization
    """

    # แปลงภาพสีเป็น Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # ปรับ Contrast ด้วย Histogram Equalization
    output = cv2.equalizeHist(gray)

    return output