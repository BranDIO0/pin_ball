// === INPUT HANDLING ===

function setupInput() {
    const leftZone = document.getElementById('left-touch');
    const rightZone = document.getElementById('right-touch');
    const plungerContainer = document.getElementById('plunger-container');
    const plungerHandle = document.getElementById('plunger-handle');

    // Linker Flipper
    leftZone.addEventListener('pointerdown', (e) => { 
        e.preventDefault(); 
        state.leftFlipper = true; 
        leftZone.classList.add('active'); 
        leftZone.setPointerCapture(e.pointerId); 
    });
    leftZone.addEventListener('pointerup', (e) => { 
        state.leftFlipper = false; 
        leftZone.classList.remove('active'); 
        leftZone.releasePointerCapture(e.pointerId); 
    });
    leftZone.addEventListener('pointercancel', () => { 
        state.leftFlipper = false; 
        leftZone.classList.remove('active'); 
    });

    // Rechter Flipper
    rightZone.addEventListener('pointerdown', (e) => { 
        e.preventDefault(); 
        state.rightFlipper = true; 
        rightZone.classList.add('active'); 
        rightZone.setPointerCapture(e.pointerId); 
    });
    rightZone.addEventListener('pointerup', (e) => { 
        state.rightFlipper = false; 
        rightZone.classList.remove('active'); 
        rightZone.releasePointerCapture(e.pointerId); 
    });
    rightZone.addEventListener('pointercancel', () => { 
        state.rightFlipper = false; 
        rightZone.classList.remove('active'); 
    });

    // Plunger
    plungerContainer.addEventListener('pointerdown', (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        state.plungerDrag = true; 
        state.plungerStartY = e.clientY;
        plungerContainer.setPointerCapture(e.pointerId);
    });
    
    plungerContainer.addEventListener('pointermove', (e) => {
        if (state.plungerDrag) {
            const dy = e.clientY - state.plungerStartY;
            state.plungerPull = Math.max(0, Math.min(1, dy / 100)); 
            plungerHandle.style.transform = `translateY(${state.plungerPull * 100}px)`;
        }
    });

    const releasePlunger = (e) => {
        if (state.plungerDrag) {
            state.plungerDrag = false;
            firePlunger(state.plungerPull);
            state.plungerPull = 0;
            plungerHandle.style.transform = `translateY(0px)`;
            plungerContainer.releasePointerCapture(e.pointerId);
        }
    };

    plungerContainer.addEventListener('pointerup', releasePlunger);
    plungerContainer.addEventListener('pointercancel', releasePlunger);
}
