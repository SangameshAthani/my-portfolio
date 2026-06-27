document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // 1. Theme Toggle & Local Storage Logic
    const themeToggle = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;

    // Load persisted theme or check system default
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const defaultTheme = savedTheme || (systemPrefersLight ? "light" : "dark");

    // Apply initial theme
    htmlElement.setAttribute("data-theme", defaultTheme);

    // Toggle click handler
    themeToggle.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // 1.1 Dashboard Tab Toggling (Telemetry vs Vibe Profile)
    const dashTabs = document.querySelectorAll(".dash-tab");
    const tabPanes = document.querySelectorAll(".tab-pane");

    dashTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");
            
            dashTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            tabPanes.forEach(pane => {
                if (pane.id === `${targetTab}Tab`) {
                    pane.classList.add("active");
                } else {
                    pane.classList.remove("active");
                }
            });

            // Trigger Lucide icons bind
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        });
    });

    // 1.2 Vibe Profile Quick Share Handler
    const btnQuickShare = document.getElementById("btnQuickShare");
    const shareToast = document.getElementById("shareToast");

    if (btnQuickShare && shareToast) {
        btnQuickShare.addEventListener("click", () => {
            const shareText = `Sangamesh Athani - AI/ML & IoT Developer Portfolio\n⚡ "Automate everything except human connection."\n\nCheck out my projects & live diagnostics:\n🔗 https://sangameshathani29.netlify.app/`;

            if (navigator.share) {
                navigator.share({
                    title: "Sangamesh Athani | Portfolio",
                    text: shareText,
                    url: "https://sangameshathani29.netlify.app/"
                })
                .catch(err => {
                    // Fallback to Clipboard copy on error/dismiss
                    copyToClipboard(shareText);
                });
            } else {
                copyToClipboard(shareText);
            }
        });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            shareToast.classList.add("show");
            setTimeout(() => {
                shareToast.classList.remove("show");
            }, 2500);
        }).catch(err => {
            console.error("Clipboard copy failed: ", err);
        });
    }


    // 2. Immersive 3D Rotating Neural Network Canvas Background
    const canvas = document.getElementById("neuralCanvas");
    const ctx = canvas.getContext("2d");

    let nodes = [];
    const maxNodesCount = window.innerWidth < 768 ? 35 : 65;
    const maxLineDistance3D = 120;
    const focalLength = 300; // Focal length for perspective division
    
    // Mouse coords and rotation speeds
    let mouse = { x: null, y: null, targetX: 0, targetY: 0 };
    let rotation = { x: 0.002, y: 0.003 }; // Ambient rotation speeds

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse for interactivity
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Calculate normalized offset from center for 3D rotation bias
        const dx = e.clientX - window.innerWidth / 2;
        const dy = e.clientY - window.innerHeight / 2;
        mouse.targetX = dx * 0.00003;
        mouse.targetY = dy * 0.00003;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    // 3D Node Constructor
    class Node3D {
        constructor() {
            // Coordinate range relative to center (bounds of a virtual 3D cube)
            this.x = (Math.random() - 0.5) * window.innerWidth * 0.6;
            this.y = (Math.random() - 0.5) * window.innerHeight * 0.6;
            this.z = (Math.random() - 0.5) * 500;
            
            // Random movement speeds in 3D
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.vz = (Math.random() - 0.5) * 0.4;
            
            this.baseSize = Math.random() * 2 + 1.5;
            this.colorType = Math.random() > 0.5 ? "cyan" : "purple";
        }

        update() {
            // Apply velocities
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;

            // Constrain particles to virtual 3D box limits
            const limitX = window.innerWidth * 0.35;
            const limitY = window.innerHeight * 0.35;
            const limitZ = 250;

            if (Math.abs(this.x) > limitX) this.vx = -this.vx;
            if (Math.abs(this.y) > limitY) this.vy = -this.vy;
            if (Math.abs(this.z) > limitZ) this.vz = -this.vz;

            // Interpolate rotation towards mouse coordinates
            rotation.x += (mouse.targetY - rotation.x) * 0.05;
            rotation.y += (mouse.targetX - rotation.y) * 0.05;

            // 3D Rotation Matrices
            // Rotate around X axis (pitch)
            let cosX = Math.cos(rotation.x);
            let sinX = Math.sin(rotation.x);
            let y1 = this.y * cosX - this.z * sinX;
            let z1 = this.z * cosX + this.y * sinX;
            this.y = y1;
            this.z = z1;

            // Rotate around Y axis (yaw)
            let cosY = Math.cos(rotation.y);
            let sinY = Math.sin(rotation.y);
            let x2 = this.x * cosY - this.z * sinY;
            let z2 = this.z * cosY + this.x * sinY;
            this.x = x2;
            this.z = z2;
        }

        project() {
            // Perspective division: project 3D coordinates onto a 2D viewport
            const scale = focalLength / (focalLength + this.z);
            
            // Screen coordinates mapped to center
            const screenX = canvas.width / 2 + this.x * scale;
            const screenY = canvas.height / 2 + this.y * scale;
            const size = this.baseSize * scale;

            // Muted colors inside Light Mode for accessibility
            const currentTheme = htmlElement.getAttribute("data-theme");
            let fillColor;
            
            if (currentTheme === "light") {
                fillColor = this.colorType === "cyan" ? "rgba(20, 184, 166, 0.6)" : "rgba(249, 115, 22, 0.6)"; // Sage-Teal or Tangerine-Copper
            } else {
                fillColor = this.colorType === "cyan" ? "rgba(16, 185, 129, 0.75)" : "rgba(168, 85, 247, 0.75)"; // Neo-Mint or Cosmic Lavender
            }

            return {
                x: screenX,
                y: screenY,
                z: this.z,
                size: size,
                color: fillColor,
                visible: (this.z > -focalLength) // Only render if node is in front of camera
            };
        }
    }

    // Initialize 3D Nodes
    function initNodes() {
        nodes = [];
        for (let i = 0; i < maxNodesCount; i++) {
            nodes.push(new Node3D());
        }
    }
    initNodes();

    // Render loop for 3D Nodes
    function render3DNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update all nodes
        nodes.forEach(node => node.update());

        // Project all nodes
        const projections = nodes.map(node => node.project());

        // Get active theme to draw lines accordingly
        const currentTheme = htmlElement.getAttribute("data-theme");
        
        // Draw 3D connection lines
        for (let i = 0; i < nodes.length; i++) {
            const p1 = projections[i];
            if (!p1.visible) continue;

            for (let j = i + 1; j < nodes.length; j++) {
                const p2 = projections[j];
                if (!p2.visible) continue;

                // Calculate distance in actual 3D space (prevents overlapping visual glitches)
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dz = nodes[i].z - nodes[j].z;
                const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist3D < maxLineDistance3D) {
                    // Line opacity scales by 3D distance
                    const opacity = (1 - dist3D / maxLineDistance3D) * 0.22;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    // Setup stroke color
                    if (currentTheme === "light") {
                        ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`; // Sage-Teal
                    } else {
                        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`; // Neo-Mint
                    }
                    
                    ctx.lineWidth = 0.7 * ((focalLength / (focalLength + (nodes[i].z + nodes[j].z)/2)));
                    ctx.stroke();
                }
            }
        }

        // Draw 3D Nodes
        projections.forEach(p => {
            if (!p.visible) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        requestAnimationFrame(render3DNetwork);
    }
    render3DNetwork();


    // 3. Custom Glowing Pointer & Trailing Cursor Ring
    const cursorRing = document.getElementById("customCursor");
    const cursorDot = document.getElementById("customCursorDot");

    let mouseCoords = { x: -100, y: -100 };
    let ringCoords = { x: -100, y: -100 };

    window.addEventListener("mousemove", (e) => {
        mouseCoords.x = e.clientX;
        mouseCoords.y = e.clientY;

        cursorDot.style.left = `${mouseCoords.x}px`;
        cursorDot.style.top = `${mouseCoords.y}px`;
    });

    function animateCursorRing() {
        const dx = mouseCoords.x - ringCoords.x;
        const dy = mouseCoords.y - ringCoords.y;

        ringCoords.x += dx * 0.15;
        ringCoords.y += dy * 0.15;

        cursorRing.style.left = `${ringCoords.x}px`;
        cursorRing.style.top = `${ringCoords.y}px`;

        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    // Bind Hover listeners dynamically to handle changes
    function bindCursorHovers() {
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-badge, .contact-item-card, .contact-photo-container, input, textarea');
        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", () => {
                cursorRing.classList.add("hovered");
                cursorDot.classList.add("hovered");
            });
            el.addEventListener("mouseleave", () => {
                cursorRing.classList.remove("hovered");
                cursorDot.classList.remove("hovered");
            });
        });
    }
    bindCursorHovers();

    window.addEventListener("mousedown", () => {
        cursorRing.classList.add("clicked");
    });
    window.addEventListener("mouseup", () => {
        cursorRing.classList.remove("clicked");
    });


    // 4. Interactive Developer Terminal Mockup Scripting
    const typewriterCmd = document.querySelector(".typewriter-command");
    const terminalOutput = document.getElementById("terminalOutput");

    const terminalScripts = [
        {
            command: "python train_transformer_model.py",
            output: `[INFO] Initializing grid health prediction network...
[INFO] Loading training dataset (N=45,000 logs)
Epoch 1/5 - loss: 0.3842 - accuracy: 0.8415
Epoch 3/5 - loss: 0.1095 - accuracy: 0.9576
Epoch 5/5 - loss: 0.0431 - accuracy: 0.9892
[SUCCESS] Optimization complete. Model saved: ./models/stamp_net.onnx`
        },
        {
            command: "arduino-cli compile --fqbn arduino:avr:uno STAMP_Relay",
            output: `Sketch uses 14,210 bytes (44%) of program storage space.
Global variables use 742 bytes (36%) of dynamic memory.
[SUCCESS] Compilation successful. Binary size: 14KB.`
        },
        {
            command: "sensor-diagnostics --port /dev/ttyUSB0",
            output: `&gt; Probing MQ2 Gas Sensors [A0, A1]... OK
&gt; Ambient PPM Concentration: 142 ppm (Normal)
&gt; Differential Filtration Efficiency: 94.2%
&gt; LCD Interface check: 16x2 I2C Display active.`
        }
    ];

    let currentScriptIdx = 0;

    function runTerminalSimulation() {
        if (!typewriterCmd) return;
        typewriterCmd.textContent = "";
        terminalOutput.style.display = "none";
        terminalOutput.innerHTML = "";

        const script = terminalScripts[currentScriptIdx];
        let charIdx = 0;

        function typeChar() {
            if (charIdx < script.command.length) {
                typewriterCmd.textContent += script.command.charAt(charIdx);
                charIdx++;
                setTimeout(typeChar, 60 + Math.random() * 40);
            } else {
                setTimeout(() => {
                    terminalOutput.innerHTML = script.output.replace(/\n/g, "<br>");
                    terminalOutput.style.display = "block";

                    currentScriptIdx = (currentScriptIdx + 1) % terminalScripts.length;
                    setTimeout(runTerminalSimulation, 5000);
                }, 600);
            }
        }

        setTimeout(typeChar, 1000);
    }
    runTerminalSimulation();


    // 5. Smooth Scrolling for Navigation & Links
    const scrollLinks = document.querySelectorAll(".nav-link, .btn, .logo");

    scrollLinks.forEach((link) => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href && href.startsWith("#")) {
                e.preventDefault();
                const targetEl = document.querySelector(href);
                if (targetEl) {
                    if (navMenu.classList.contains("mobile-open")) {
                        navMenu.classList.remove("mobile-open");
                        mobileToggle.classList.remove("active");
                    }

                    const headerOffset = 90;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });


    // 6. Active Section Scrollspy (Header Link Highlighting)
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    function scrollspy() {
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });

        // Toggle back to top button visibility
        const backToTopBtn = document.getElementById("backToTopBtn");
        if (backToTopBtn) {
            if (window.pageYOffset > 500) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }

        // Toggle header scroll styling
        const header = document.querySelector(".header");
        if (header) {
            if (window.pageYOffset > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    }
    window.addEventListener("scroll", scrollspy);
    scrollspy();


    // Back to top click handler
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }


    // 7. Mobile Hamburger Toggle Menu
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            navMenu.classList.toggle("mobile-open");
        });
    }


    // 8. Scroll-Reveal Animation using Motion (or IntersectionObserver fallback)
    const revealElements = document.querySelectorAll(".reveal");

    if (typeof Motion !== "undefined") {
        const { animate, inView, stagger } = Motion;
        
        revealElements.forEach((el) => {
            inView(el, ({ target }) => {
                // If it is a stagger wrapper, stagger animate its children
                if (target.classList.contains("stagger-wrapper")) {
                    const children = target.querySelectorAll(".timeline-item, .edu-item, .project-card-wrapper, .cert-category-card, .bio-paragraph");
                    if (children.length > 0) {
                        target.classList.add("active");
                        children.forEach(c => {
                            c.style.opacity = 0;
                            c.style.transform = "translateY(30px)";
                        });
                        animate(
                            children,
                            { opacity: [0, 1], y: [30, 0] },
                            { 
                                delay: stagger(0.15),
                                type: "spring",
                                stiffness: 50,
                                damping: 15
                            }
                        );
                        return;
                    }
                }
                
                // Otherwise do single reveal
                animate(
                    target,
                    { opacity: [0, 1], y: [30, 0] },
                    { 
                        type: "spring",
                        stiffness: 50,
                        damping: 15
                    }
                );
                target.classList.add("active");
            }, { margin: "0px 0px -40px 0px" });
        });
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.10,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach((el) => {
            revealObserver.observe(el);
        });
    }


    // 9. Skill badges Hover Inspection Panel
    const skillBadges = document.querySelectorAll(".skill-badge");
    const skillViewer = document.getElementById("skillDescription");

    skillBadges.forEach((badge) => {
        badge.addEventListener("mouseenter", function() {
            const desc = this.getAttribute("data-desc");
            const skillName = this.querySelector("span").textContent;
            
            if (skillViewer) {
                skillViewer.style.opacity = 0;
                setTimeout(() => {
                    skillViewer.innerHTML = `<strong>${skillName}</strong>: ${desc || "General developer tool utilized in prototyping and project coordination."}`;
                    
                    // Style matching current border color
                    const style = window.getComputedStyle(this);
                    skillViewer.style.borderLeftColor = style.borderColor || "var(--color-cyan)";
                    skillViewer.style.opacity = 1;
                }, 120);
            }
        });
    });


    // 10. Project Modal Dialog Open/Close Handlers
    const projectCards = document.querySelectorAll(".project-card");
    const closeBtns = document.querySelectorAll("[data-close-modal]");

    projectCards.forEach((card) => {
        const btn = card.querySelector(".project-cta-btn");
        const projectKey = card.getAttribute("data-project");
        const modal = document.getElementById(`modal-${projectKey}`);

        if (btn && modal) {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const scrollY = window.scrollY;
                document.body.style.position = "fixed";
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = "100%";
                
                modal.showModal();
                modal.dataset.scrollY = scrollY;
            });
        }
    });

    closeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close-modal");
            const modal = document.getElementById(`modal-${modalId}`);
            if (modal) {
                modal.close();
                
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                
                const scrollY = parseInt(modal.dataset.scrollY || "0");
                window.scrollTo(0, scrollY);
            }
        });
    });

    // Close Modal on backdrop click
    const modals = document.querySelectorAll(".project-modal");
    modals.forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.close();
                
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                
                const scrollY = parseInt(modal.dataset.scrollY || "0");
                window.scrollTo(0, scrollY);
            }
        });

        modal.addEventListener("cancel", () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            
            const scrollY = parseInt(modal.dataset.scrollY || "0");
            setTimeout(() => window.scrollTo(0, scrollY), 50);
        });
    });


    // 11. Minimalist Contact Form AJAX Routing via FormSubmit API
    const contactForm = document.getElementById("contactForm");
    const formFeedback = document.getElementById("formFeedback");
    
    const feedbackSpinner = document.getElementById("feedbackSpinner");
    const feedbackSuccess = document.getElementById("feedbackSuccess");
    const feedbackTitle = document.getElementById("feedbackTitle");
    const feedbackMsg = document.getElementById("feedbackMsg");
    const btnFeedbackClose = document.getElementById("btnFeedbackClose");

    if (contactForm && formFeedback) {
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const nameVal = document.getElementById("name").value.trim();
            const emailVal = document.getElementById("email").value.trim();
            const msgVal = document.getElementById("message").value.trim();

            if (!nameVal || !emailVal || !msgVal) return;

            // Enable loading state
            feedbackSpinner.classList.remove("hide");
            feedbackSuccess.classList.add("hide");
            btnFeedbackClose.classList.add("hide");
            formFeedback.classList.add("active");

            feedbackTitle.textContent = "Transmitting message...";
            feedbackMsg.innerHTML = "&gt; Syncing with secure SMTP relay...";

            // Step-by-step developer telemetry feedback simulation
            setTimeout(() => {
                feedbackMsg.innerHTML = `&gt; Resolving MX record for ${emailVal.split("@")[1] || "domain"}...<br>&gt; Establishing TLS 1.3 socket handshake...`;
            }, 1000);

            setTimeout(() => {
                feedbackMsg.innerHTML = `&gt; Packing telemetry variables (Sender: ${nameVal})<br>&gt; Performing anti-spam integrity evaluation... PASS`;
            }, 2200);

            // Execute actual AJAX request to FormSubmit API
            setTimeout(() => {
                feedbackMsg.innerHTML = `&gt; Dispatching encrypted payload to secure SMTP relay...`;
                
                fetch("https://formsubmit.co/ajax/sangmeshtahani6@gmail.com", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        name: nameVal,
                        email: emailVal,
                        message: msgVal,
                        _subject: `New Portfolio Message from ${nameVal}`,
                        _captcha: "false"
                    })
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("SMTP mail relay error");
                })
                .then(data => {
                    // Success state
                    feedbackSpinner.classList.add("hide");
                    feedbackSuccess.classList.remove("hide");
                    feedbackTitle.textContent = "Transmission Complete";
                    feedbackMsg.innerHTML = `&gt; Message successfully routed to SMTP mail server.<br>&gt; Email queued for delivery. I will reach out to you shortly!`;
                    btnFeedbackClose.classList.remove("hide");
                    
                    // Refresh interactive cursor triggers in case items were locked
                    bindCursorHovers();
                })
                .catch(err => {
                    // Error state fallback
                    feedbackSpinner.classList.add("hide");
                    feedbackTitle.textContent = "Connection Failure";
                    feedbackMsg.innerHTML = `&gt; Warning: Failed to route directly via AJAX.<br>&gt; Fallback triggered: Click Close to submit via traditional form redirect.`;
                    btnFeedbackClose.classList.remove("hide");
                    
                    // Allow the user to fallback to typical form submission
                    btnFeedbackClose.onclick = () => {
                        formFeedback.classList.remove("active");
                        contactForm.submit(); // execute standard POST submission
                    };
                });
            }, 3200);
        });

        btnFeedbackClose.addEventListener("click", () => {
            formFeedback.classList.remove("active");
            contactForm.reset();
        });
    }

    // ==========================================================================
    // 8. Circuit Hacker Game Logic
    // ==========================================================================
    const hackerGame = document.getElementById("hackerGame");
    if (hackerGame) {
        const gameOverlay = document.getElementById("gameOverlay");
        const startGameBtn = document.getElementById("startGameBtn");
        const nextLevelBtn = document.getElementById("nextLevelBtn");
        const connectBtn = document.getElementById("connectBtn");
        
        const dragWire = document.getElementById("dragWire");
        const targetPinA0 = document.getElementById("targetPinA0");
        const timer1Span = document.getElementById("timer1");
        
        const choices = document.querySelectorAll(".choice-btn");
        const codeGap = document.getElementById("codeGap");
        
        const rerouteBtn = document.getElementById("rerouteBtn");
        const deployProgress = document.getElementById("deployProgress");
        const timer3Span = document.getElementById("timer3");
        
        const achievementCard = document.getElementById("achievementCard");
        const achievementTitle = document.getElementById("achievementTitle");
        const achievementDesc = document.getElementById("achievementDesc");
        const finalWinScreen = document.getElementById("finalWinScreen");
        
        const levels = [
            document.getElementById("level1"),
            document.getElementById("level2"),
            document.getElementById("level3")
        ];
        const statusNodes = [
            document.getElementById("node1"),
            document.getElementById("node2"),
            document.getElementById("node3")
        ];
        
        let currentLevel = 0; // 0: IoT, 1: Python, 2: Deploy
        let level1Timer = null;
        let level1TimeLeft = 10;
        let isLevel1Active = false;
        
        let level3Interval = null;
        let level3Progress = 0;
        let isLevel3Active = false;
        
        // Milestone strings to show as rewards
        const milestones = [
            "Smart Distribution Transformer Monitoring (STAMP) Project data metrics unlocked!",
            "Trip Master AI-Powered Travel Planner repository files parsed successfully!",
            "Network Security Monitoring script configurations loaded to dashboard local caches!"
        ];

        // Click selection tracking for click-to-connect fallback
        let isWireSelected = false;

        // Reset & initialize elements
        function initGame() {
            currentLevel = 0;
            isWireSelected = false;
            if (dragWire) {
                dragWire.style.transform = "none";
                dragWire.classList.remove("selected");
            }
            if (targetPinA0) {
                targetPinA0.classList.add("highlight");
                targetPinA0.classList.remove("connected");
            }
            if (codeGap) {
                codeGap.textContent = "_______";
                codeGap.classList.remove("filled");
            }
            choices.forEach(btn => {
                btn.classList.remove("incorrect");
                btn.disabled = false;
            });
            deployProgress.style.width = "0%";
            deployProgress.classList.remove("success");
            timer3Span.textContent = "100%";
            timer3Span.classList.add("text-orange");

            levels.forEach((lvl, idx) => {
                if (idx === 0) lvl.classList.add("active");
                else lvl.classList.remove("active");
            });
            statusNodes.forEach((node, idx) => {
                node.className = "status-node" + (idx === 0 ? " active" : "");
            });
            achievementCard.style.display = "none";
            finalWinScreen.style.display = "none";
        }

        // Show start screen overlay with interactive decrypt console logging
        startGameBtn.addEventListener("click", () => {
            startGameBtn.disabled = true;
            const consoleBox = document.getElementById("overlayConsole");
            if (consoleBox) {
                consoleBox.innerHTML = `> INJECTING DECRYPTION EXPLOIT... OK<br>> CORRUPTING SEGMENT BLOCKS... OK`;
                
                setTimeout(() => {
                    consoleBox.innerHTML += `<br>> DECRYPTING MAINPORT SECURE CODES... PASS`;
                }, 400);
                
                setTimeout(() => {
                    consoleBox.innerHTML += `<br>> INITIATING DIAGNOSTIC GRID RELAYS... READY`;
                }, 850);
            }

            setTimeout(() => {
                gameOverlay.style.opacity = "0";
                setTimeout(() => {
                    gameOverlay.style.visibility = "hidden";
                    initGame();
                    startLevel1();
                    startGameBtn.disabled = false;
                }, 400);
            }, 1400);
        });

        // ==========================================
        // LEVEL 1: IoT Jumper Wire
        // ==========================================
        function startLevel1() {
            isLevel1Active = true;
            level1TimeLeft = 10;
            timer1Span.textContent = level1TimeLeft;
            timer1Span.classList.remove("text-red");
            timer1Span.classList.add("text-orange");

            if (level1Timer) clearInterval(level1Timer);
            level1Timer = setInterval(() => {
                if (!isLevel1Active) return;
                level1TimeLeft--;
                timer1Span.textContent = level1TimeLeft;
                if (level1TimeLeft <= 3) {
                    timer1Span.classList.remove("text-orange");
                    timer1Span.classList.add("text-red");
                }
                if (level1TimeLeft <= 0) {
                    clearInterval(level1Timer);
                    failLevel1("Timeout! The MQ2 Sensor exploded due to disconnected terminal grids.");
                }
            }, 1000);
        }

        function failLevel1(reason) {
            isLevel1Active = false;
            alert(reason + " Diagnostic failing. Retrying system verification...");
            initGame();
            startLevel1();
        }

        // --- Drag and Drop: HTML5 API ---
        dragWire.addEventListener("dragstart", (e) => {
            if (!isLevel1Active) return;
            e.dataTransfer.setData("text/plain", "wire");
            dragWire.classList.add("dragging");
        });

        dragWire.addEventListener("dragend", () => {
            dragWire.classList.remove("dragging");
        });

        targetPinA0.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        targetPinA0.addEventListener("drop", (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData("text/plain");
            if (data === "wire" && isLevel1Active) {
                winLevel1();
            }
        });

        // --- Drag and Drop: Mobile Touch Events ---
        let touchStartPos = { x: 0, y: 0 };

        dragWire.addEventListener("touchstart", (e) => {
            if (!isLevel1Active) return;
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            dragWire.classList.add("dragging");
        }, { passive: true });

        dragWire.addEventListener("touchmove", (e) => {
            if (!isLevel1Active) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartPos.x;
            const deltaY = touch.clientY - touchStartPos.y;
            dragWire.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }, { passive: true });

        dragWire.addEventListener("touchend", (e) => {
            if (!isLevel1Active) return;
            dragWire.classList.remove("dragging");
            
            // Check bounding box collision
            const pinRect = targetPinA0.getBoundingClientRect();
            const wireRect = dragWire.getBoundingClientRect();

            // Detect overlap
            if (
                wireRect.right > pinRect.left &&
                wireRect.left < pinRect.right &&
                wireRect.bottom > pinRect.top &&
                wireRect.top < pinRect.bottom
            ) {
                winLevel1();
            } else {
                // Snap back
                dragWire.style.transform = "none";
            }
        });

        // --- Fallback Click-to-Connect ---
        dragWire.addEventListener("click", () => {
            if (!isLevel1Active) return;
            isWireSelected = true;
            dragWire.classList.add("selected");
        });

        targetPinA0.addEventListener("click", () => {
            if (isWireSelected && isLevel1Active) {
                winLevel1();
            }
        });

        function winLevel1() {
            isLevel1Active = false;
            clearInterval(level1Timer);
            targetPinA0.classList.remove("highlight");
            targetPinA0.classList.add("connected");
            dragWire.style.transform = "none";
            dragWire.style.opacity = "0.5";
            dragWire.draggable = false;
            
            statusNodes[0].className = "status-node completed";
            showAchievement(0, "IoT Sensor Calibrated!");
        }

        // ==========================================
        // LEVEL 2: Python Compiler choice
        // ==========================================
        function startLevel2() {
            levels[0].classList.remove("active");
            levels[1].classList.add("active");
            statusNodes[1].className = "status-node active";
        }

        choices.forEach(button => {
            button.addEventListener("click", () => {
                const choice = button.getAttribute("data-choice");
                if (choice === "get_status") {
                    codeGap.textContent = "get_status";
                    codeGap.classList.add("filled");
                    button.disabled = true;
                    setTimeout(() => {
                        winLevel2();
                    }, 800);
                } else {
                    button.classList.add("incorrect");
                    setTimeout(() => {
                        button.classList.remove("incorrect");
                    }, 600);
                }
            });
        });

        function winLevel2() {
            statusNodes[1].className = "status-node completed";
            showAchievement(1, "Python Diagnostics Compiled!");
        }

        // ==========================================
        // LEVEL 3: Port Deployment
        // ==========================================
        function startLevel3() {
            levels[1].classList.remove("active");
            levels[2].classList.add("active");
            statusNodes[2].className = "status-node active";
            
            isLevel3Active = true;
            level3Progress = 0;
            deployProgress.style.width = level3Progress + "%";
            
            const banner = document.getElementById("alertBanner3");
            if (banner) {
                banner.textContent = "SYS_ATTACK: FLOODING DETECTED | MEMORY LEAK IMMINENT";
                banner.className = "alert-banner blinking font-code";
            }
            levels[2].classList.remove("high-threat");
            timer3Span.classList.remove("text-red");
            timer3Span.classList.add("text-orange");
            timer3Span.style.color = "";

            if (level3Interval) clearInterval(level3Interval);
            level3Interval = setInterval(() => {
                if (!isLevel3Active) return;
                
                // Exponential acceleration threat index speed scaling
                let increment = 0.8 + (level3Progress * 0.04);
                level3Progress += increment;
                
                deployProgress.style.width = Math.min(level3Progress, 100) + "%";
                
                // Show countdown overflow percentage
                const overflowChanceLeft = Math.max(Math.ceil(100 - level3Progress), 0);
                timer3Span.textContent = overflowChanceLeft + "%";

                if (level3Progress > 60) {
                    levels[2].classList.add("high-threat");
                    timer3Span.classList.remove("text-orange");
                    timer3Span.classList.add("text-red");
                    if (banner) {
                        banner.textContent = "WARNING: BUFFER OVERFLOW IN PROGRESS! OVERHEAT REGISTERED!";
                        banner.classList.add("blinking-fast");
                    }
                }

                if (level3Progress >= 100) {
                    clearInterval(level3Interval);
                    failLevel3("Buffer Overflow! Rerouting failed to execute in time.");
                }
            }, 150);
        }

        function failLevel3(reason) {
            isLevel3Active = false;
            levels[2].classList.remove("high-threat");
            alert(reason + " Port blocked. Refreshing deployment configurations...");
            startLevel3();
        }

        rerouteBtn.addEventListener("click", () => {
            if (isLevel3Active) {
                winLevel3();
            }
        });

        function winLevel3() {
            isLevel3Active = false;
            clearInterval(level3Interval);
            levels[2].classList.remove("high-threat");
            deployProgress.style.width = "100%";
            deployProgress.classList.add("success");
            timer3Span.textContent = "0% (Secure)";
            timer3Span.classList.remove("text-orange", "text-red");
            timer3Span.style.color = "#10b981";
            
            const banner = document.getElementById("alertBanner3");
            if (banner) {
                banner.textContent = "SYSTEM RESOLVED: SSL ROUTING COMPLETE";
                banner.className = "alert-banner resolved font-code";
            }
            
            statusNodes[2].className = "status-node completed";
            setTimeout(() => {
                showAchievement(2, "Secure AWS Router Deployed!");
            }, 600);
        }

        // ==========================================
        // Achievement Card & Flow System
        // ==========================================
        function showAchievement(levelIdx, title) {
            achievementTitle.textContent = title;
            achievementDesc.textContent = milestones[levelIdx];
            achievementCard.style.display = "flex";
            
            // Re-bind Lucide icons inside dynamically shown overlays
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        }

        nextLevelBtn.addEventListener("click", () => {
            achievementCard.style.display = "none";
            currentLevel++;
            if (currentLevel === 1) {
                startLevel2();
            } else if (currentLevel === 2) {
                startLevel3();
            } else {
                showFinalWin();
            }
        });

        function showFinalWin() {
            levels[2].classList.remove("active");
            finalWinScreen.style.display = "flex";
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        }

        // Final win button action - Connect & Scroll
        connectBtn.addEventListener("click", () => {
            const contactFormWrapper = document.querySelector(".contact-form-wrapper");
            const contactSection = document.getElementById("contact");
            if (contactFormWrapper && contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
                
                // Spotlight highlight animation on the form
                contactFormWrapper.classList.add("spotlight");
                setTimeout(() => {
                    contactFormWrapper.classList.remove("spotlight");
                }, 4500);
            }
        });
    }

    // ==========================================================================
    // 9. Global 3D Spatial Interactive Framework
    // ==========================================================================
    const tiltCards = document.querySelectorAll(".tilt-card");
    tiltCards.forEach((card) => {
        const glares = [];
        if (card.classList.contains("flip-card")) {
            const front = card.querySelector(".card-front");
            const back = card.querySelector(".card-back");
            if (front) {
                let gFront = front.querySelector(".glare-mask");
                if (!gFront) {
                    gFront = document.createElement("div");
                    gFront.className = "glare-mask";
                    front.appendChild(gFront);
                }
                glares.push(gFront);
            }
            if (back) {
                let gBack = back.querySelector(".glare-mask");
                if (!gBack) {
                    gBack = document.createElement("div");
                    gBack.className = "glare-mask";
                    back.appendChild(gBack);
                }
                glares.push(gBack);
            }
            
            card.addEventListener("click", function(e) {
                if (window.innerWidth <= 1024) {
                    if (e.target.closest("button") || e.target.closest("a")) {
                        return;
                    }
                    this.classList.toggle("flipped");
                }
            });
        } else {
            let g = card.querySelector(".glare-mask");
            if (!g) {
                g = document.createElement("div");
                g.className = "glare-mask";
                card.appendChild(g);
            }
            glares.push(g);
        }

        if (typeof Motion !== "undefined") {
            const { animate } = Motion;

            card.addEventListener("mouseenter", () => {
                animate(card, { 
                    "--card-scale": 1.03, 
                    "--card-translate-y": "-6px" 
                }, { 
                    type: "spring", 
                    stiffness: 120, 
                    damping: 14 
                });
            });

            card.addEventListener("mousedown", () => {
                animate(card, { 
                    "--card-scale": 0.98,
                    "--card-translate-y": "-3px"
                }, { 
                    duration: 0.1 
                });
            });

            card.addEventListener("mouseup", () => {
                animate(card, { 
                    "--card-scale": 1.03,
                    "--card-translate-y": "-6px"
                }, { 
                    duration: 0.15 
                });
            });

            let rAFToken = null;
            card.addEventListener("mousemove", (e) => {
                if (rAFToken) {
                    cancelAnimationFrame(rAFToken);
                }
                rAFToken = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const percentX = (x - centerX) / centerX;
                    const percentY = (y - centerY) / centerY;

                    const maxTilt = 10;
                    const rotateX = -percentY * maxTilt;
                    const rotateY = percentX * maxTilt;

                    card.style.setProperty("--card-rotate-x", rotateX + "deg");
                    card.style.setProperty("--card-rotate-y", rotateY + "deg");

                    glares.forEach((glare) => {
                        const glareX = percentX * 50 + 50;
                        const glareY = percentY * 50 + 50;
                        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`;
                        glare.style.opacity = 1;
                    });
                });
            });

            card.addEventListener("mouseleave", () => {
                if (rAFToken) {
                    cancelAnimationFrame(rAFToken);
                }
                animate(card, { 
                    "--card-scale": 1.0, 
                    "--card-translate-y": "0px",
                    "--card-rotate-x": "0deg",
                    "--card-rotate-y": "0deg"
                }, { 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 15 
                });
                
                glares.forEach((glare) => {
                    animate(glare, { opacity: 0 }, { duration: 0.3 });
                });
            });

        } else {
            let rAFToken = null;
            card.addEventListener("mousemove", (e) => {
                if (rAFToken) {
                    cancelAnimationFrame(rAFToken);
                }
                rAFToken = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const percentX = (x - centerX) / centerX;
                    const percentY = (y - centerY) / centerY;

                    const maxTilt = 10;
                    const rotateX = -percentY * maxTilt;
                    const rotateY = percentX * maxTilt;

                    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                    glares.forEach((glare) => {
                        const glareX = percentX * 50 + 50;
                        const glareY = percentY * 50 + 50;
                        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
                    });
                });
            });

            card.addEventListener("mouseleave", () => {
                if (rAFToken) {
                    cancelAnimationFrame(rAFToken);
                }
                card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
                glares.forEach((glare) => {
                    glare.style.background = "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, transparent 60%)";
                });
            });
        }
    });

    // Inertial scroll depth-parallax animation (cached query selectors to prevent layout reflow thrashing)
    const parallaxCanvas = document.getElementById("neuralCanvas");
    const parallaxHeaders = document.querySelectorAll(".section-header");
    const parallaxExpItems = document.querySelectorAll(".timeline-item");
    const parallaxProjCards = document.querySelectorAll(".project-card-wrapper");
    const parallaxEduItems = document.querySelectorAll(".edu-item");
    const parallaxGameWrapper = document.querySelector(".game-wrapper");

    let ticked = false;
    window.addEventListener("scroll", () => {
        if (!ticked) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                
                // Parallax shift background 3D canvas
                if (parallaxCanvas) {
                    parallaxCanvas.style.transform = `translateY(${scrollY * 0.15}px)`;
                }

                // Parallax shift section headers slightly slower
                parallaxHeaders.forEach((header) => {
                    const rect = header.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        header.style.transform = `translateY(${(window.innerHeight - rect.top) * 0.04}px)`;
                    }
                });

                // Parallax shift Experience timeline content wrapper item nodes
                parallaxExpItems.forEach((item, idx) => {
                    const rect = item.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const speed = (idx % 2 === 0) ? 0.025 : -0.015;
                        item.style.transform = `translateY(${(window.innerHeight - rect.top) * speed}px)`;
                    }
                });

                // Parallax shift Projects card wrappers
                parallaxProjCards.forEach((card, idx) => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const speed = (idx % 2 === 0) ? 0.025 : -0.015;
                        card.style.transform = `translateY(${(window.innerHeight - rect.top) * speed}px)`;
                    }
                });

                // Parallax shift Education timeline wrapper item nodes
                parallaxEduItems.forEach((item, idx) => {
                    const rect = item.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const speed = (idx % 2 === 0) ? 0.025 : -0.015;
                        item.style.transform = `translateY(${(window.innerHeight - rect.top) * speed}px)`;
                    }
                });

                // Parallax shift Mini-game container wrapper wrapper
                if (parallaxGameWrapper) {
                    const rect = parallaxGameWrapper.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        parallaxGameWrapper.style.transform = `translateY(${(window.innerHeight - rect.top) * 0.02}px)`;
                    }
                }
                
                ticked = false;
            });
            ticked = true;
        }
    }, { passive: true });

    // 10. Shared Focus Underline Animation for Contact Form (Framer Motion layoutId simulation)
    const contactFormWrapper = document.querySelector(".contact-form-wrapper");
    const formFields = document.querySelectorAll("#contactForm input, #contactForm textarea");

    if (contactFormWrapper && formFields.length > 0 && typeof Motion !== "undefined") {
        const { animate } = Motion;
        
        const sharedUnderline = document.createElement("div");
        sharedUnderline.className = "shared-focus-underline";
        contactFormWrapper.appendChild(sharedUnderline);

        formFields.forEach(field => {
            field.addEventListener("focus", () => {
                const fieldRect = field.getBoundingClientRect();
                const wrapperRect = contactFormWrapper.getBoundingClientRect();

                const relativeLeft = fieldRect.left - wrapperRect.left;
                const relativeTop = fieldRect.bottom - wrapperRect.top - 2; 
                const width = fieldRect.width;

                sharedUnderline.style.opacity = 1;
                animate(
                    sharedUnderline,
                    { 
                        left: `${relativeLeft}px`,
                        top: `${relativeTop}px`,
                        width: `${width}px`
                    },
                    { 
                        type: "spring",
                        stiffness: 150,
                        damping: 18
                    }
                );
            });

            field.addEventListener("blur", () => {
                setTimeout(() => {
                    if (document.activeElement !== field && !Array.from(formFields).includes(document.activeElement)) {
                        sharedUnderline.style.opacity = 0;
                    }
                }, 50);
            });
        });
    }

    // 11. Multi-Axis Mouse Tracking for Anime AI Model
    document.addEventListener('mousemove', (e) => {
        const model = document.querySelector('.anime-model-image');
        if(!model) return;
        const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
        model.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
});
