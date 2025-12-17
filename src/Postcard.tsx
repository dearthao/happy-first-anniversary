import React, { useState, useEffect, useCallback } from 'react';
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
import img13 from './assets/13.jpg';


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
  { id: 13, src: img13, alt: "Gallery Image 13" },
];

const IMAGE_COUNT = galleryImages.length;

const ImageGalleryBackground = ({ images, visibleIndex, fadeTimestamps, isOpen }) => {
  const [currentPositions, setCurrentPositions] = useState([]);

  const calculatePositions = useCallback((imgs) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const vmin = Math.min(winW, winH) / 100;

    const IMG_W = 15 * vmin;
    const IMG_H = 10 * vmin;
    const PC_W = 90 * vmin;
    const PC_H = PC_W * (2/3);
    const GAP = 2.5 * vmin;

    // Optimized height for 13-inch MacBook Air to fit 5 strips
    const STRIP_H = IMG_H + (2 * IMG_W * 0.20); 
    
    const pcTop = (winH / 2) - (PC_H / 2);
    const pcBottom = (winH / 2) + (PC_H / 2);
    const flapTop = pcTop - PC_H;

    const pcRect = {
      left: (winW - PC_W) / 2 - GAP,
      right: (winW + PC_W) / 2 + GAP,
      top: flapTop - GAP,
      bottom: pcBottom + GAP
    };

    let strips = [];
    let currentY = 0;

    // Greedy strip generation: fill the bottom-most area
    while (currentY < winH - (IMG_H / 2)) {
      const yStart = currentY;
      const actualStripH = Math.min(STRIP_H, winH - yStart);
      const yEnd = yStart + actualStripH;
      const overlapsPC = !(yEnd < pcRect.top || yStart > pcRect.bottom);

      strips.push({
        y: yStart,
        centerY: yStart + (actualStripH / 2) - (IMG_H / 2),
        isBlockedCenter: overlapsPC,
        occupied: []
      });
      currentY += STRIP_H;
    }

    const positions = new Array(imgs.length).fill(null);

    imgs.forEach((img) => {
      let placed = false;
      // Find the strip with the least images to ensure even distribution
      const sortedStrips = [...strips].sort((a, b) => a.occupied.length - b.occupied.length);

      for (let s = 0; s < sortedStrips.length && !placed; s++) {
        const strip = sortedStrips[s];
        
        for (let attempt = 0; attempt < 1000; attempt++) {
          const x = Math.random() * (winW - IMG_W);
          const cLeft = x - GAP;
          const cRight = x + IMG_W + GAP;

          if (strip.isBlockedCenter) {
            if (!(cRight < pcRect.left || cLeft > pcRect.right)) continue;
          }

          const hitsOther = strip.occupied.some(o => !(cRight < o.l || cLeft > o.r));
          if (hitsOther) continue;

          strip.occupied.push({ l: cLeft, r: cRight });
          const originalIndex = imgs.findIndex(i => i.id === img.id);
          positions[originalIndex] = {
            top: `${strip.centerY}px`,
            left: `${x}px`,
            width: `${IMG_W}px`,
            height: `${IMG_H}px`,
            transform: `rotate(${Math.random() * 30 - 15}deg)`,
            position: 'absolute' as const,
            zIndex: 10
          };
          placed = true;
          break;
        }
      }
    });
    return positions;
  }, []);

  // Sync positions on initial load and window resize
  useEffect(() => {
    setCurrentPositions(calculatePositions(images));
    const handleResize = () => setCurrentPositions(calculatePositions(images));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, calculatePositions]);

  // Shuffle logic: re-calculate after the flap opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCurrentPositions(calculatePositions(images));
      }, 1800); 
      return () => clearTimeout(timer);
    }
  }, [isOpen, images, calculatePositions]);

  if (currentPositions.length === 0) return null;

  return (
    <div className="background-gallery">
      {images.map((img, index) => {
        const isVisible = (index + 1) <= visibleIndex;
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
      for (let i = 1; i <= IMAGE_COUNT; i++) {
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
      setFadeTimestamps(new Array(IMAGE_COUNT).fill(0));
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