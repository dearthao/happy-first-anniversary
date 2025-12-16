import React, { useState, useEffect } from 'react';
import './postcard.css'; 

// --- 1. IMPORT ALL NECESSARY IMAGES ---
// Ensure these paths are correct relative to this file's location (e.g., in src/assets/)

// Postcard Cover Image
import coverImagePath from './assets/bg.jpg'; 

// 10 Background Gallery Images
import img1 from './assets/1.jpg'; 
import img2 from './assets/2.jpg'; 
import img3 from './assets/3.jpg'; 
import img4 from './assets/4.JPG'; 
import img5 from './assets/5.JPG'; 
import img6 from './assets/6.png'; 
import img7 from './assets/7.jpg'; 
import img8 from './assets/8.jpg'; 
import img9 from './assets/9.jpg'; 
import img10 from './assets/10.JPG';
import img11 from './assets/11.JPG';  
import img12 from './assets/12.jpg';  

const galleryImages = [
  { id: 1, src: img1, alt: "Gallery Image 1" },
  { id: 2, src: img2, alt: "Gallery Image 2" },
  { id: 3, src: img3, alt: "Gallery Image 3" },
  { id: 4, src: img4, alt: "Gallery Image 4" },
  { id: 5, src: img5, alt: "Gallery Image 5" },
  { id: 6, src: img6, alt: "Gallery Image 6" },
  { id: 7, src: img7, alt: "Gallery Image 7" },
  { id: 8, src: img8, alt: "Gallery Image 8" },
  { id: 9, src: img9, alt: "Gallery Image 9" },
  { id: 10, src: img10, alt: "Gallery Image 10" },
  { id: 11, src: img11, alt: "Gallery Image 11" },
  { id: 12, src: img12, alt: "Gallery Image 12" },
];

const IMAGE_COUNT = galleryImages.length;
const PC_WIDTH = 900;
const PC_HEIGHT = 600;
const EXCLUSION_ZONE_HEIGHT = PC_HEIGHT * 2;
const VIEWPORT_MARGIN = 20;

const IMG_WIDTH = 140; 
const IMG_HEIGHT = 210;
const SAFE_SIZE = 260;
const GAP = 30;

let occupiedAreas = [];

const intersects = (newRect) => {
  for (const oldRect of occupiedAreas) {
    if (newRect.left > oldRect.right ||
        newRect.right < oldRect.left ||
        newRect.top > oldRect.bottom ||
        newRect.bottom < oldRect.top) {
        continue; 
    }
    return true; 
  }
  return false; 
};

const calculateNonOverlappingPosition = (id) => {
  const WINDOW_WIDTH = window.innerWidth;
  const WINDOW_HEIGHT = window.innerHeight;
  const EXCLUSION_CENTER_Y = WINDOW_HEIGHT / 2;
  const FLAP_HEIGHT = PC_HEIGHT;

  const EXCLUSION_LEFT = (WINDOW_WIDTH / 2) - (PC_WIDTH / 2);
  const EXCLUSION_RIGHT = (WINDOW_WIDTH / 2) + (PC_WIDTH / 2);
  const EXCLUSION_TOP = EXCLUSION_CENTER_Y - (FLAP_HEIGHT / 2) - FLAP_HEIGHT; 
  const EXCLUSION_BOTTOM = EXCLUSION_CENTER_Y + (FLAP_HEIGHT / 2);

  const SafeExclusionTop = Math.max(VIEWPORT_MARGIN, EXCLUSION_TOP); 

  const MIN_Y = VIEWPORT_MARGIN; 
  const MAX_Y = WINDOW_HEIGHT - SAFE_SIZE - VIEWPORT_MARGIN; 
  const MIN_X = VIEWPORT_MARGIN;
  const MAX_X = WINDOW_WIDTH - SAFE_SIZE - VIEWPORT_MARGIN;

  const MAX_ATTEMPTS = 10000;

  let randX, randY;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    
    const quadrant = Math.floor(Math.random() * 4); 

    if (quadrant === 0) { // LEFT side
      const leftLimit = EXCLUSION_LEFT - SAFE_SIZE;
      if (leftLimit > MIN_X) {
        randX = MIN_X + Math.random() * (leftLimit - MIN_X);
      } else { continue; }
      randY = MIN_Y + Math.random() * (MAX_Y - MIN_Y); 

    } else if (quadrant === 1) { // RIGHT side
      const rightStart = EXCLUSION_RIGHT;
      if (MAX_X > rightStart) {
        randX = rightStart + Math.random() * (MAX_X - rightStart);
      } else { continue; }
      randY = MIN_Y + Math.random() * (MAX_Y - MIN_Y);

    } else if (quadrant === 2) { // TOP side
      randX = MIN_X + Math.random() * (MAX_X - MIN_X);

      const topLimit = SafeExclusionTop - SAFE_SIZE;
      if (topLimit > MIN_Y) {
        randY = MIN_Y + Math.random() * (topLimit - MIN_Y);
      } else {
        continue; 
      }
    } else { // BOTTOM side
        randX = MIN_X + Math.random() * (MAX_X - MIN_X);

        const bottomStart = EXCLUSION_BOTTOM;
        if (MAX_Y > bottomStart) {
          randY = bottomStart + Math.random() * (MAX_Y - bottomStart);
        } else {
          continue;
        }
    }
    const newRect = {
      left: randX - GAP,
      right: randX + SAFE_SIZE + GAP,
      top: randY - GAP,
      bottom: randY + SAFE_SIZE + GAP,
    };
    
    if (!intersects(newRect)) {
      occupiedAreas.push(newRect);
      return { 
        top: `${randY}px`, 
        left: `${randX}px`, 
        transform: `rotate(${Math.random() * 30 - 15}deg)` 
      };
    }
  }

  console.warn(`Could not place image ${id} without overlap after ${MAX_ATTEMPTS} attempts. Placing off-screen.`);
  return { top: '-500px', left: '-500px', transform: 'rotate(0deg)' };
};

const ImageGalleryBackground = ({ images, visibleIndex, fadeTimestamps, isOpen }) => {
    const [currentPositions, setCurrentPositions] = useState([]);
    useEffect(() => {
      if (currentPositions.length === 0) {
        occupiedAreas = []; 
        const initialPositions = images.map(img => calculateNonOverlappingPosition(img.id));
        setCurrentPositions(initialPositions);
      }
    }, [currentPositions.length, images]);

    useEffect(() => {
      let positionTimer;

      if (isOpen) {
        positionTimer = setTimeout(() => {
          occupiedAreas = []; 
          const newPositions = images.map(img => calculateNonOverlappingPosition(img.id));
          setCurrentPositions(newPositions);
        }, 1800);
      } else {}
      return () => {
        if (positionTimer) {
          clearTimeout(positionTimer);
        }
      };
    }, [isOpen, images]); 

    if (currentPositions.length === 0) {
      return <div className="background-gallery"></div>;
    }

    return (
      <div className="background-gallery">
        {images.map((img, index) => {
          const imageId = index + 1; 
          const isVisible = imageId <= visibleIndex; 
          const isFading = fadeTimestamps[index] > 0;
          const animationClass = 
            (!isOpen && visibleIndex > 0) ? 'show-all' : 
            (isFading && isOpen) ? 'faded-out' :     
            isVisible ? 'visible' : 'hidden';           
          return (
            <div 
              key={img.id} 
              className={`gallery-item item-${img.id} ${animationClass}`}
              style={currentPositions[index]}
            >
              <img src={img.src} alt={img.alt} className="gallery-img" />
            </div>
          );
        })}
    </div>
  );
};


const Postcard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0); // 0 = hidden, 1-10 = revealed
  const [fadeTimestamps, setFadeTimestamps] = useState(new Array(IMAGE_COUNT).fill(0));

  const handleClick = () => {
    if (isOpen) {
      setVisibleIndex(IMAGE_COUNT); // Show all immediately
      setFadeTimestamps(new Array(IMAGE_COUNT).fill(0)); 
    } else {
      setVisibleIndex(0); 
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    document.title = "Happy Anniversary";
    let timers = [];
    
    if (isOpen && visibleIndex === 0) {
      for (let i = 1; i <= galleryImages.length; i++) {
        const revealDelay = i * 10000; // 10 seconds per image

        const revealTimer = setTimeout(() => {
          setVisibleIndex(i);

          const fadeDelay = 20000; 
          
          const fadeTimer = setTimeout(() => {
            setFadeTimestamps(prevTimestamps => {
              const newTimestamps = [...prevTimestamps];
              newTimestamps[i - 1] = Date.now(); 
              return newTimestamps;
            });
          }, fadeDelay); 

          timers.push(fadeTimer);
        }, revealDelay);

        timers.push(revealTimer);
      }
    } else if (!isOpen) {
      setFadeTimestamps(new Array(galleryImages.length).fill(0));
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isOpen]);
  return (
    <div className="app-layout">
      <ImageGalleryBackground 
        images={galleryImages} 
        visibleIndex={visibleIndex} 
        fadeTimestamps={fadeTimestamps}
        isOpen={isOpen}
      />
      <div className="postcard-container">
        <div 
          className={`postcard ${isOpen ? 'open' : ''}`} 
          onClick={handleClick}
        >
          <div className="postcard-inside">
            <h2 className="message-title">From vanh with ❤️</h2>
            
            <div className="message-body">
              <p className="message-content">
                Thời gian trôi nhanh thiệt mới vậy mà mình đã yêu nhau được 1 năm rồi. Xin lỗi mình rất nhiều vì lần này anh không ở Việt Nam để cùng em làm kỉ niệm cho cả 2 đứa. Mong em chỉ giận anh 1 chút thôi chứ không giận nhiều 😢. Lần này anh không về được nên anh làm chiếc thiệp này để tặng cho em (Mong mình thông cảm vì anh không code web bao giờ nên trông nó có hơi cùi 1 chút)
              </p>
              <p className="message-content">
                Cảm ơn em vì đã xuất hiện và đồng hành cùng anh trong 2 năm từ lúc mình còn chưa là người yêu cho đến lần kỉ niệm yêu nhau đầu tiên này. Cảm ơn em vì trong suốt thời gian đó đã luôn ở bên và tin tưởng anh. Anh thật sự rất biết ơn vì kể cả trong những lúc chính anh cũng không tin tưởng vảo bản thân mình thì em lại vẫn luôn ở bên và đặt niềm tin ở anh 🥺.
              </p>
              <p className="message-content">
                Cảm ơn em vì đã dành rất nhiều tình cảm cho anh. Anh có cảm nhận được qua lời nói, cử chỉ, hành động và cả những món quà em tặng anh nữa. Mong là trong thời gian tới mình sẽ tiếp tục phát huy hơn nữa nhá 😘.
              </p>
               <p className="message-content">
                Anh không phải người lãng mạn và thậm chí cảm thấy ngại khi nói những lời tình cảm (cái này chắc là do bẩm sinh) nhưng anh hy vọng là những hành động anh làm đã thể hiện được tình cảm của anh và mình cũng cảm nhận được nó. Và nếu khi nào mình cảm thấy không được vui vì ít khi thấy anh thể hiện tình cảm thì mình hãy nói với anh nhá để anh cố gắng sửa dần dần 🥲
              </p>
              <p className="message-content">
                Lần này anh không về được cũng là vì quyết định mà chắc là sẽ làm cho chuyện tình cảm của 2 đứa mình khó khăn hơn nhiều phần so với trước. Anh biết là em đã rất buồn và suy nghĩ nhiều về chuyện này (chắc là em cũng có trách anh nhiều lắm 😞) nhưng anh mong cả 2 đứa mình sẽ cùng cố gắng vượt qua nó nhé vì anh không muốn nó sẽ trở thành quyết định mà sau này khiến anh phải ân hận. Nên cũng mong em sẽ tiếp tục giúp đỡ anh như những lần trước nhá.
              </p>
              <p className="message-content">
                Lúc này chắc là ảnh bên ngoài cũng hiện ra hết rùi. Anh để nó hiện theo thứ thời gian từ lúc mình bắt đầu quen nhau cho đến bây giờ. Mong là mình sẽ tiếp tục bên nhau vượt qua thời gian này để có thêm nhiều lần kỉ niệm nữa nhá. Happy our first anniversary 😘😘😘.
              </p>
            </div>

            <p className="message-closing">
             To Thanh Thảo ❤️<br/>
            </p>
          </div>
          <div className="postcard-cover-flap">
            <div className="flap-front">
              <img 
                src={coverImagePath} 
                alt="Postcard Cover" 
                className="cover-image"
              />
            </div>
            <div className={`corner-text-ribbon ${isOpen ? 'is-open' : ''}`}>
              Happy our first anniversary!
            </div>
            <div className="flap-back"></div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Postcard;