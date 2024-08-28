import axios from 'axios';
import { useEffect, useState } from 'react';

// Example image data with names


const ImageListSlider = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the list of images from the backend
    axios.get('/cgi-bin/imagesList.cgi')
      .then(response => {
        console.log('Response data:', response.data); // Inspect the response
        if (Array.isArray(response.data.images)) {
          setImages(response.data.images);
        } else {
          throw new Error('Response data.images is not an array');
        }
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        setError('Failed to fetch images');
      });
  }, []);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4 h-[calc(100vh-8rem)]"> {/* Adjust height based on navbar */}
      {/* Image List - only visible on desktop */}
      <div className="hidden md:w-1/3 md:flex flex-col overflow-auto">

        <h2 className="text-xl font-semibold mb-2">Saved Images</h2>
        <ul className="space-y-2">
          {images.length > 0 ? (
            images.map((img, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 rounded-lg hover:bg-gray-100 ${currentIndex === index ? 'bg-blue-200' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                {img}
              </li>
            ))
          ) : (
            <li>No images found</li>
          )}
        </ul>
      </div>
      {/* Image Slider */}
      <div className="relative flex-grow max-w-full md:max-w-2/3 overflow-hidden rounded-lg">
        <img
          src={`/cgi-bin/image_details2.cgi?name=${images[currentIndex]}`}
          alt={images[currentIndex]}
          className="w-full h-full object-contain "
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
          aria-label="Previous"
        >
          &lt;
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
          aria-label="Next"
        >
          &gt;
        </button>
      </div>


    </div>
  );
};

export default ImageListSlider;
