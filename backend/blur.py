from PIL import ImageFilter


BLUR_RADII = {
    "low": 3,
    "medium": 8,
    "high": 16,
}


def blur_image(source_image, radius):
    return source_image.filter(
        ImageFilter.GaussianBlur(radius=radius)
    )
