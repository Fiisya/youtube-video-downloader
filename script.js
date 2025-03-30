document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem('dark-mode') === 'true' || 
                   (!localStorage.getItem('dark-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    updateDarkModeIcon(isDark);

    darkModeToggle.addEventListener('click', function() {
        const newMode = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('dark-mode', newMode);
        updateDarkModeIcon(newMode);
    });
});

function updateDarkModeIcon(isDark) {
    document.querySelector('.sun').classList.toggle('hidden', !isDark);
    document.querySelector('.moon').classList.toggle('hidden', isDark);
}

// Original video functionality
async function fetchVideoInfo() {
    let urlInput = document.getElementById("videoUrl").value.trim();
    let loadingIndicator = document.getElementById("loading");
    let videoDetailsContainer = document.getElementById("videoDetails");
    let errorMessageBox = document.getElementById("errorMessage");

    // Function to show error messages in UI
    function showError(message) {
        errorMessageBox.innerText = message;
        errorMessageBox.style.display = "block";
        setTimeout(() => { errorMessageBox.style.display = "none"; }, 4000); // Auto-hide after 4s
    }

    // Validate URL
    let youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})(\S*)?$/;
    if (!youtubeRegex.test(urlInput)) {
        showError("❌ Please enter a valid YouTube video URL!");
        return;
    }

    // Show loading, hide previous results & errors
    loadingIndicator.style.display = "block";
    videoDetailsContainer.style.display = "none";
    errorMessageBox.style.display = "none"; // Hide error if previously shown

    try {
        let response = await fetch(`https://youtubevideodownloader-bzt4.onrender.com/video_info?url=${encodeURIComponent(urlInput)}`);
        let data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch video details.");
        }

        if (!data.video_streams?.length && !data.audio_streams?.length) {
            throw new Error("No downloadable formats available for this video.");
        }

        // Update Video Details
        document.getElementById("videoTitle").innerText = data.title;
        document.getElementById("videoThumbnail").src = data.thumbnail;

        // Render options
        renderDownloadOptions("videoOptions", data.video_streams, "resolution", "video");
        renderDownloadOptions("audioOptions", data.audio_streams, "abr", "audio");

        videoDetailsContainer.style.display = "block";
    } catch (error) {
        showError(`⚠️ ${error.message}`);
    } finally {
        loadingIndicator.style.display = "none";
    }
}


function renderDownloadOptions(containerId, streams, qualityKey, type) {
    let container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!streams || streams.length === 0) {
        container.innerHTML = `<p class="text-gray-600 dark:text-gray-400 text-center">No ${type} options available.</p>`;
        return;
    }

    streams.forEach(stream => {
        let div = document.createElement("div");
        div.className = "border dark:border-gray-600 rounded-xl p-3 flex justify-between items-center shadow-md dark:bg-darkInput transition-colors";
        div.innerHTML = `
            <div class="text-gray-800 dark:text-white">${stream[qualityKey]} (${stream.type}) - ${stream.file_size} ${stream.file_type}</div>
            <div>
                <a class="group inline-block rounded-full bg-gradient-button p-[2px] hover:text-white focus:ring-2 focus:outline-none transition-colors"
                    href="${stream.download_url}" target="_blank">
                    <span class="block rounded-full bg-white px-8 py-3 text-sm font-medium group-hover:bg-transparent dark:text-black dark:hover:text-white">
                        Download
                    </span>
                </a>
            </div>
        `;
        container.appendChild(div);
    });
}
