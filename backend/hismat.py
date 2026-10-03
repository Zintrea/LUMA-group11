from PIL import Image
import numpy as np
from skimage.exposure import match_histograms


def hismat(source_image, reference_image):
    source = np.array(source_image)
    reference = np.array(reference_image)

    matched = match_histograms(
        source,
        reference,
        channel_axis=-1
    )

    matched = np.clip(matched, 0, 255).astype(np.uint8)

    return Image.fromarray(matched)