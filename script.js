function previewImages() {
    console.log("Starting image preview...");
    const input = document.getElementById('uploadInput');
    const previewContainer = document.getElementById('previewContainer');
    const downloadButton = document.querySelector('button[onclick="downloadImages()"]');
    const images = input.files;
    const counterElement = document.getElementById('counter');
    let isDownloadButtonActive = false;

    let currentImageIndex = 0;

    previewContainer.innerHTML = '';
    downloadButton.style.background = "";
    counterElement.textContent = `0/${images.length} images loaded`;

    function previewNextImage() {
        console.log(`Previewing image ${currentImageIndex + 1} of ${images.length}`);
        downloadButton.style.display = 'block';
        counterElement.style.display = 'block';
        counterElement.textContent = `${currentImageIndex}/${images.length} images loaded`;

        if (currentImageIndex < images.length) {
            previewImage(images[currentImageIndex]);
        } else {
            console.log("All images previewed, showing download button.");
            isDownloadButtonActive = true; // Activate the download button
            downloadButton.style.background = "#ffcb47";
        }
    }

    function previewImage(image) {
        console.log(`Processing image: ${image.name}`);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = URL.createObjectURL(image);

        img.onload = function () {
            console.log("Image loaded successfully.");
            downloadButton.style.display = 'none';
            progressCounter.style.display = "none";

            // Calculate margins based on black pixels
            const margins = calculateMargins(img);

            // Set canvas dimensions to the cropped size
            canvas.width = img.width - margins.left - margins.right;
            canvas.height = img.height - margins.top - margins.bottom;

            // Draw the content onto the cropped canvas
            ctx.drawImage(
                img,
                margins.left, margins.top,
                canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height
            );

            // Display the preview on the page
            const previewImageElement = new Image();
            previewImageElement.src = canvas.toDataURL();
            previewImageElement.classList.add('preview-image');
            previewImageElement.loading = "lazy"
            previewContainer.appendChild(previewImageElement);

            // Move to the next image
            currentImageIndex++;
            previewNextImage();
        };
    }

    // Start previewing the first image
    previewNextImage();
}

function downloadImages() {
    const input = document.getElementById('uploadInput');
    const images = input.files;
    const fillerCheckbox = document.getElementById('fillerCheckbox');
    const additionalTextField = document.getElementById('additionalText');
    const downloadButton = document.querySelector('button[onclick="downloadImages()"]');
    const progressCounter = document.getElementById('progressCounter');
    let downloadedCount = 1;

    if (additionalTextField.value.trim() === "") {
        const emptyText = document.getElementById("emptyText");
        alert(emptyText.textContent);
        return;
    }

    // Sort images based on their names
    const sortedImages = Array.from(images).sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    function downloadNextImage(index) {
        if (index < sortedImages.length) {
            const image = sortedImages[index];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const counterElement = document.getElementById('counter');

            const img = new Image();
            img.src = URL.createObjectURL(image);

            img.onload = function () {
                counterElement.style.display = "none";
                // Calculate margins based on black pixels
                const margins = calculateMargins(img);

                // Set canvas dimensions to the cropped size
                canvas.width = img.width - margins.left - margins.right;
                canvas.height = img.height - margins.top - margins.bottom;

                // Draw the content onto the cropped canvas
                ctx.drawImage(
                    img,
                    margins.left, margins.top,
                    canvas.width, canvas.height,
                    0, 0, canvas.width, canvas.height
                );

                // Convert the canvas to a data URL with JPEG format
                const jpegDataURL = canvas.toDataURL('image/jpeg', 1); // Adjust quality if needed

                const now = new Date();
                const timestamp = padNumber(now.getUTCSeconds()) +
                '_' + padNumber(now.getUTCMilliseconds());


                // Get additional text from the input field
                const additionalText = additionalTextField.value;

                // Determine whether to add 'filler' suffix
                const suffix = fillerCheckbox.checked ? 'filler' : '';

                // Create the final filename
                const finalFileName = timestamp + downloadedCount + '_' + additionalText + '_' + suffix + '.jpg';

                // Trigger download for each image with the timestamped name
                const downloadLink = document.createElement('a');
                downloadLink.href = jpegDataURL;

                // Use the final filename for the cropped image
                downloadLink.download = finalFileName;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Update the progress counter
                progressCounter.style.display = "block";
                downloadedCount++;
                progressCounter.textContent = `${downloadedCount - 1y}/${images.length} images downloaded`;

                // Wait before downloading the next image
                setTimeout(() => {
                    downloadNextImage(index + 1);
                }, 300);
            };
        }
    }

    // Start downloading the first image
    downloadNextImage(0);
}

// Helper function to pad single digits with a leading zero
function padNumber(number) {
    return number < 10 ? '0' + number : number;
}

function calculateMargins(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to the image size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate margins based on black pixels
    let leftMargin = canvas.width;
    let rightMargin = 0;
    let topMargin = canvas.height;
    let bottomMargin = 0;

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];

            if (!(red < 30 && green < 30 && blue < 30)) {
                // Update left and right margins
                leftMargin = Math.min(leftMargin, x);
                rightMargin = Math.max(rightMargin, x);
                // Update top and bottom margins
                topMargin = Math.min(topMargin, y);
                bottomMargin = Math.max(bottomMargin, y);
            }
        }
    }

    return {
        left: leftMargin,
        right: canvas.width - rightMargin,
        top: topMargin,
        bottom: canvas.height - bottomMargin
    };
}
