
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

        // Check if the download button is active
        if (isDownloadButtonActive) {
            downloadButton.style.background = "#ffcb47";
        } else {
            downloadButton.style.background = "";
        }

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
        const finalWidth = 1625;
        const finalHeight = 1220;

        const img = new Image();
        img.src = URL.createObjectURL(image);

        img.onload = function () {
            console.log("Image loaded successfully.");
            downloadButton.style.display = 'none';
            progressCounter.style.display = "none";

            // Calculate left and right margins based on black pixels
            const leftMargin = calculateMargin(img, 'left');
            const rightMargin = calculateMargin(img, 'right');

            // Calculate cropped dimensions based on margins
            const cropWidth = img.width - leftMargin - rightMargin;
            const cropHeight = (cropWidth / finalWidth) * finalHeight;

            // Set canvas dimensions to the final size
            canvas.width = finalWidth;
            canvas.height = finalHeight;

            // Draw the content onto the cropped canvas
            ctx.drawImage(img, leftMargin, 0, cropWidth, cropHeight, 0, 0, finalWidth, finalHeight);

            // Display the preview on the page
            const previewImageElement = new Image();
            previewImageElement.src = canvas.toDataURL();
            previewImageElement.classList.add('preview-image');
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
    let downloadedCount = 0;


    // Check if the download button is active
    if (downloadButton.style.background !== "rgb(255, 203, 71)") {
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
            const finalWidth = 1625;
            const finalHeight = 1220;
            const counterElement = document.getElementById('counter');

            const img = new Image();
            img.src = URL.createObjectURL(image);

            img.onload = function () {
                counterElement.style.display = "none";
                // Calculate left and right margins based on black pixels
                const leftMargin = calculateMargin(img, 'left');
                const rightMargin = calculateMargin(img, 'right');

                // Calculate cropped dimensions based on margins
                const cropWidth = img.width - leftMargin - rightMargin;
                const cropHeight = (cropWidth / finalWidth) * finalHeight;

                // Set canvas dimensions to the final size
                canvas.width = finalWidth;
                canvas.height = finalHeight;

                // Draw the content onto the cropped canvas
                ctx.drawImage(img, leftMargin, 0, cropWidth, cropHeight, 0, 0, finalWidth, finalHeight);

                // Convert the canvas to a data URL with JPEG format
                const jpegDataURL = canvas.toDataURL('image/jpeg', 1); // Adjust quality if needed

                const now = new Date();
                const timestamp = now.getUTCFullYear() +
                    '_' + padNumber(now.getUTCMonth() + 1) +
                    '_' + padNumber(now.getUTCDate()) +
                    '_' + padNumber(now.getUTCHours()) +
                    '_' + padNumber(now.getUTCMinutes()) +
                    '_' + padNumber(now.getUTCSeconds());

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
                progressCounter.textContent = `${downloadedCount}/${images.length} images downloaded`;

                
                downloadNextImage(index + 1);
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

function calculateMargin(img, direction) {
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
    if (direction === 'left') {
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const index = (y * canvas.width + x) * 4;
                const red = data[index];
                const green = data[index + 1];
                const blue = data[index + 2];

                if (!(red < 30 && green < 30 && blue < 30)) {
                    return x;
                }
            }
        }
    } else if (direction === 'right') {
        for (let x = canvas.width - 1; x >= 0; x--) {
            for (let y = 0; y < canvas.height; y++) {
                const index = (y * canvas.width + x) * 4;
                const red = data[index];
                const green = data[index + 1];
                const blue = data[index + 2];

                if (!(red < 30 && green < 30 && blue < 30)) {
                    return canvas.width - 1 - x;
                }
            }
        }
    }

    return 0;
}