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
    // ==========================================================================
    // 11. "The Sandbox" 3D Open-World Driving Simulator
    // ==========================================================================
    const modalSandbox = document.getElementById("modal-sandbox");
    const btnLaunchEngine = document.getElementById("btnLaunchSandboxEngine");
    const garageOverlay = document.getElementById("garageOverlay");
    const simulatorContainer = document.getElementById("simulatorContainer");
    const btnCloseSandbox = document.getElementById("btnCloseSandbox");
    
    // HUD element binders
    const hudSpeedVal = document.getElementById("hudSpeed");
    const hudGearVal = document.getElementById("hudGear");
    const hudRpmVal = document.getElementById("hudRpm");
    const hudRpmFill = document.getElementById("hudRpmFill");
    const hudCheckpointsVal = document.getElementById("hudCheckpoints");
    const hudTimerVal = document.getElementById("hudTimer");
    const hudDamageVal = document.getElementById("hudDamage");
    const hudDamageFill = document.getElementById("hudDamageFill");
    const stormToggle = document.getElementById("stormToggle");
    const splitToast = document.getElementById("splitToast");
    const splitToastTime = document.getElementById("splitToastTime");
    
    // Garage selector cards
    const vehicleCards = document.querySelectorAll(".vehicle-option-card");
    let selectedVehicleType = "race"; // default

    vehicleCards.forEach(card => {
        card.addEventListener("click", () => {
            vehicleCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedVehicleType = card.getAttribute("data-vehicle");
        });
    });

    // Vehicle Parameter Matrix
    const vehicleSpecs = {
        race: {
            mass: 1100,
            suspensionK: 45000,
            suspensionC: 1500,
            clearance: 0.22,
            maxTravel: 0.35,
            friction: 0.9,
            maxEngineForce: 8500,
            steeringRatio: 1.1,
            color: 0x10B981 // Neo-Mint
        },
        suv: {
            mass: 2200,
            suspensionK: 25000,
            suspensionC: 3000,
            clearance: 0.45,
            maxTravel: 0.45,
            friction: 0.8,
            maxEngineForce: 9500,
            steeringRatio: 0.6,
            color: 0xF97316 // Tangerine-Copper
        },
        jeep: {
            mass: 1800,
            suspensionK: 18000,
            suspensionC: 2200,
            clearance: 0.50,
            maxTravel: 0.50,
            friction: 1.2, // High traction climbing terrain
            maxEngineForce: 10500,
            steeringRatio: 0.75,
            color: 0x14B8A6 // Sage-Teal
        },
        sedan: {
            mass: 1600,
            suspensionK: 30000,
            suspensionC: 4000, // Highly damped
            clearance: 0.28,
            maxTravel: 0.38,
            friction: 0.95,
            maxEngineForce: 7800,
            steeringRatio: 0.85,
            color: 0xA855F7 // Cosmic Lavender
        }
    };

    // Engine Core Variables
    let scene, camera, renderer, animationFrameId;
    let carChassis, bodyMesh, wheels = [];
    let groundMesh, obstacles = [];
    let keys = { w: false, a: false, s: false, d: false, space: false, r: false, m: false };
    let checkpoints = [];
    let nextCheckpointIndex = 0;
    
    // Physics & Damage States
    let pos = new THREE.Vector3(0, 5, 0);
    let vel = new THREE.Vector3(0, 0, 0);
    let heading = 0; // Yaw
    let pitch = 0;
    let roll = 0;
    let yawVel = 0;
    let gear = "D";
    let isAirborne = false;
    let rpm = 1000;
    let raceStartTime = 0;
    let checkpointTimes = [];
    let physicsConfig = {};
    let isInitialized = false;

    // Damage arrays
    let chassisOriginalVertices = [];
    let cumulativeDamage = 0;
    let steerPullSign = 1; // randomly pulls left (-1) or right (+1)

    // Dynamic Weather States
    let weatherState = {
        isStorm: false,
        rainSystem: null,
        rainMaxParticles: 1200,
        sunAngle: 0,
        dayCycleSpeed: 0.00015
    };
    let ambientLight, sunLight;
    
    // Droplets overlay canvas
    let dropletCanvas = null;
    let dropletCtx = null;
    let screenDroplets = [];

    // Particle Emitters (Smoke & Dust)
    let wheelParticleSystem = null;
    const maxWheelParticles = 120;
    let wheelParticleGeo, wheelParticleMat;
    let wheelParticles = [];

    // Fluid Wake Ripples
    let wakeRings = [];
    const maxWakeRings = 15;
    let waterPlane = null;

    // Web Audio Synthesizer variables
    let audioCtx = null;
    let engineOsc1 = null, engineOsc2 = null;
    let engineFilter = null, engineGain = null;
    let screechOsc = null, screechGain = null;

    // Mini-map canvases
    const minimapCanvas = document.getElementById("minimapCanvas");
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext("2d") : null;

    // Instanced Particles for Splashes
    let particleSystem = null;
    const maxParticles = 60;
    let particleGeometry, particleMaterial;
    let activeParticles = [];

    // Terrain elevation heightmap lookup
    function getTerrainHeight(x, z) {
        // Base rolling hills
        let h = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 5;
        
        // Ramps: rises up to 5 meters along the incline
        // Ramp 1 (North-East Loop)
        if (x >= 20 && x <= 45 && z >= -75 && z <= -55) {
            let t = (x - 20) / 25; // rises along X
            h = Math.max(h, t * 7);
        }
        // Ramp 2 (South-West Loop)
        if (x >= -55 && x <= -30 && z >= 35 && z <= 55) {
            let t = (-30 - x) / 25; // rises along negative X
            h = Math.max(h, t * 7);
        }
        return h;
    }

    // Hooke's Law Suspension Compression Math
    let lastSuspensionCompression = [0, 0, 0, 0]; // FL, FR, RL, RR
    let lastCompVel = [0, 0, 0, 0];

    function updateSuspensionForces(dt) {
        if (!isAirborne) {
            let config = physicsConfig;
            let currentCompression = [];
            
            // FL, FR, RL, RR wheel offsets relative to chassis center
            const wheelOffsets = [
                new THREE.Vector3(1.2, -config.clearance, 1.8),  // Front Left
                new THREE.Vector3(-1.2, -config.clearance, 1.8), // Front Right
                new THREE.Vector3(1.2, -config.clearance, -1.8), // Rear Left
                new THREE.Vector3(-1.2, -config.clearance, -1.8) // Rear Right
            ];

            let creakTriggered = false;

            for (let i = 0; i < 4; i++) {
                // Calculate world positions of attachment points
                let offset = wheelOffsets[i].clone();
                offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
                let wPos = pos.clone().add(offset);
                
                let gHeight = getTerrainHeight(wPos.x, wPos.z);
                let dist = wPos.y - gHeight;
                let compression = config.maxTravel - dist;

                if (compression > 0) {
                    compression = Math.min(compression, config.maxTravel);
                    let compVel = (compression - lastSuspensionCompression[i]) / dt;
                    
                    // Hooke's Law: F = -k * x - c * v
                    let fSusp = (config.suspensionK * compression) + (config.suspensionC * compVel);
                    currentCompression.push(compression);
                    
                    // Trigger landing suspension creak if compression velocity is extremely high
                    if (compVel > 3.8 && !creakTriggered) {
                        playSuspensionCreak();
                        creakTriggered = true;
                    }
                    
                    // Animate Wheel Mesh visually
                    if (wheels[i]) {
                        wheels[i].position.y = wheelOffsets[i].y + (compression * 0.85);
                    }
                } else {
                    currentCompression.push(0);
                    if (wheels[i]) {
                        wheels[i].position.y = wheelOffsets[i].y;
                    }
                }
                lastSuspensionCompression[i] = compression;
            }
        }
    }

    // Initialize Web Audio Synth API
    function startAudioSystem() {
        if (audioCtx) return;
        
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // 1. Sawtooth Oscillator for engine base hum
            engineOsc1 = audioCtx.createOscillator();
            engineOsc1.type = 'sawtooth';
            engineOsc1.frequency.setValueAtTime(45, audioCtx.currentTime);
            
            // 2. Triangle Oscillator for engine harmonics (chorus depth)
            engineOsc2 = audioCtx.createOscillator();
            engineOsc2.type = 'triangle';
            engineOsc2.frequency.setValueAtTime(67.5, audioCtx.currentTime);
            engineOsc2.detune.setValueAtTime(10, audioCtx.currentTime);

            // Lowpass filter to muffle structural engine blocks
            engineFilter = audioCtx.createBiquadFilter();
            engineFilter.type = 'lowpass';
            engineFilter.frequency.setValueAtTime(280, audioCtx.currentTime);
            
            // Engine Gain
            engineGain = audioCtx.createGain();
            engineGain.gain.setValueAtTime(0.01, audioCtx.currentTime);

            // Connections
            engineOsc1.connect(engineFilter);
            engineOsc2.connect(engineFilter);
            engineFilter.connect(engineGain);
            engineGain.connect(audioCtx.destination);
            
            engineOsc1.start(0);
            engineOsc2.start(0);

            // 3. Screech Oscillator for sliding tyres
            screechOsc = audioCtx.createOscillator();
            screechOsc.type = 'triangle';
            screechOsc.frequency.setValueAtTime(950, audioCtx.currentTime);
            
            screechGain = audioCtx.createGain();
            screechGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
            
            screechOsc.connect(screechGain);
            screechGain.connect(audioCtx.destination);
            screechOsc.start(0);
        } catch (e) {
            console.warn("Web Audio API not supported or blocked: ", e);
        }
    }

    function updateAudio(dt) {
        if (!audioCtx) return;

        // Engine Pitch shift mapped to RPM
        let pitchFreq = 30 + (rpm / 7000) * 170;
        engineOsc1.frequency.setTargetAtTime(pitchFreq, audioCtx.currentTime, 0.05);
        engineOsc2.frequency.setTargetAtTime(pitchFreq * 1.5, audioCtx.currentTime, 0.05);

        // Engine volume mapping throttle inputs
        let engineVol = 0.05 + (keys.w ? 0.08 : 0.0) + (Math.abs(rpm) / 7000) * 0.07;
        engineGain.gain.setTargetAtTime(engineVol, audioCtx.currentTime, 0.05);

        // Tire screech synthesizer volume mapping drifts
        let isDrifting = keys.space && vel.length() > 3.5;
        let lateralVelocity = vel.dot(new THREE.Vector3(Math.cos(heading), 0, -Math.sin(heading)));
        let isSlipping = Math.abs(lateralVelocity) > 6.0;
        
        let targetScreechVol = (isDrifting || isSlipping) ? 0.07 : 0.0;
        screechGain.gain.setTargetAtTime(targetScreechVol, audioCtx.currentTime, 0.04);
        
        // Modulate screech pitch slightly for sliding realism
        let screechPitch = 920 + Math.sin(Date.now() * 0.02) * 50 + (vel.length() * 2);
        screechOsc.frequency.setValueAtTime(screechPitch, audioCtx.currentTime);
    }

    function playCollisionSound() {
        if (!audioCtx) return;
        try {
            let bufferSize = audioCtx.sampleRate * 0.35; // 0.35s sound
            let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            let data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1; // white noise
            }
            let noiseNode = audioCtx.createBufferSource();
            noiseNode.buffer = buffer;
            
            let filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(160, audioCtx.currentTime);
            filter.Q.setValueAtTime(1.8, audioCtx.currentTime);
            
            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.26, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noiseNode.start(0);
        } catch (e) {}
    }

    function playSuspensionCreak() {
        if (!audioCtx) return;
        try {
            let osc = audioCtx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.18);
            
            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(0);
            osc.stop(audioCtx.currentTime + 0.2);
        } catch (e) {}
    }

    // Initialize WebGL Scene
    function initSandboxEngine() {
        if (isInitialized) return;
        
        physicsConfig = vehicleSpecs[selectedVehicleType];
        
        // Start Sound context
        startAudioSystem();

        // 1. Scene & Renderer setup
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020408, 0.007);
        
        const canvas = document.getElementById("sandboxCanvas");
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Create overlay canvas for screen rain droplets
        createDropletOverlayCanvas();

        // 2. Camera Setup
        camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        
        // Reset state values
        pos.set(0, 4, 0);
        vel.set(0, 0, 0);
        heading = 0;
        pitch = 0;
        roll = 0;
        yawVel = 0;
        gear = "D";
        cumulativeDamage = 0;
        steerPullSign = Math.random() > 0.5 ? 1 : -1;
        nextCheckpointIndex = 0;
        raceStartTime = Date.now();
        weatherState.sunAngle = 0.5; // start mid-day

        if (hudDamageVal) hudDamageVal.textContent = "0%";
        if (hudDamageFill) hudDamageFill.style.width = "0%";

        // Bind storm toggle listener
        if (stormToggle) {
            stormToggle.checked = false;
            weatherState.isStorm = false;
            stormToggle.addEventListener("change", handleStormToggle);
        }

        // 3. Ambient & Directional Lighting
        ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambientLight);

        sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 300;
        let d = 80;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        scene.add(sunLight);

        // 4. Generate Terrain Ground Mesh
        const groundSize = 350;
        const groundSegments = 100;
        const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);
        groundGeo.rotateX(-Math.PI / 2);

        // Displace vertices analytically using terrain height lookup
        const posAttr = groundGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            let vx = posAttr.getX(i);
            let vz = posAttr.getZ(i);
            posAttr.setY(i, getTerrainHeight(vx, vz));
        }
        groundGeo.computeVertexNormals();

        // High-end dark grid styling for terrain
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0c0f1d,
            roughness: 0.85,
            metalness: 0.1,
            flatShading: true
        });
        groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // Wireframe grid lines overlaying ground
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x16203a,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const groundWire = new THREE.Mesh(groundGeo, wireframeMat);
        scene.add(groundWire);

        // Water plane body in valleys
        const waterGeo = new THREE.PlaneGeometry(160, 160);
        waterGeo.rotateX(-Math.PI / 2);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x03182b,
            roughness: 0.08,
            metalness: 0.95,
            transparent: true,
            opacity: 0.80
        });
        waterPlane = new THREE.Mesh(waterGeo, waterMat);
        waterPlane.position.set(0, -2.1, 0); // procedurally sits at -2.1 elevation
        scene.add(waterPlane);

        // 5. Build Ramps, Obstacles, and Boundary fences
        buildOpenWorldAssets();

        // 6. Build Car Chassis Mesh
        buildVehicleMesh();

        // 7. Setup Checkpoints
        buildRaceCheckpoints();

        // 8. Particle Systems
        buildParticles();
        buildWheelParticles();

        // Wake ripple pool initialization
        wakeRings = [];

        // Event listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        
        isInitialized = true;
        animateSimulator();
    }

    function createDropletOverlayCanvas() {
        const canvas = document.getElementById("sandboxCanvas");
        if (!canvas) return;
        
        dropletCanvas = document.createElement("canvas");
        dropletCanvas.id = "dropletCanvas";
        dropletCanvas.style.position = "absolute";
        dropletCanvas.style.top = "0";
        dropletCanvas.style.left = "0";
        dropletCanvas.style.width = "100%";
        dropletCanvas.style.height = "100%";
        dropletCanvas.style.pointerEvents = "none";
        dropletCanvas.style.zIndex = "5";
        
        canvas.parentNode.appendChild(dropletCanvas);
        
        dropletCanvas.width = canvas.clientWidth;
        dropletCanvas.height = canvas.clientHeight;
        dropletCtx = dropletCanvas.getContext("2d");
        
        screenDroplets = [];
    }

    function handleStormToggle() {
        weatherState.isStorm = stormToggle.checked;
        if (weatherState.isStorm) {
            buildRainSystem();
        } else {
            removeRainSystem();
        }
    }

    function buildRainSystem() {
        if (weatherState.rainSystem) return;
        
        const count = weatherState.rainMaxParticles;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        // Distribute rain in a box centered at the camera
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Linear vertical particle styling
        const rainMat = new THREE.PointsMaterial({
            color: 0x7dd3fc,
            size: 0.15,
            transparent: true,
            opacity: 0.45
        });

        weatherState.rainSystem = new THREE.Points(rainGeo, rainMat);
        scene.add(weatherState.rainSystem);
    }

    function removeRainSystem() {
        if (weatherState.rainSystem) {
            scene.remove(weatherState.rainSystem);
            weatherState.rainSystem.geometry.dispose();
            weatherState.rainSystem.material.dispose();
            weatherState.rainSystem = null;
        }
    }

    function buildOpenWorldAssets() {
        obstacles = [];
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

        // Visual Ramps corresponding to physics regions
        // Ramp 1
        const ramp1Geo = new THREE.BoxGeometry(8, 2, 25);
        ramp1Geo.rotateX(-0.25);
        const ramp1Mesh = new THREE.Mesh(ramp1Geo, obstacleMat);
        ramp1Mesh.position.set(32.5, 3.5, -50);
        ramp1Mesh.castShadow = true;
        ramp1Mesh.receiveShadow = true;
        scene.add(ramp1Mesh);
        obstacles.push(ramp1Mesh);

        // Ramp 2
        const ramp2Geo = new THREE.BoxGeometry(8, 2, 25);
        ramp2Geo.rotateX(0.25);
        const ramp2Mesh = new THREE.Mesh(ramp2Geo, obstacleMat);
        ramp2Mesh.position.set(-42.5, 3.5, 45);
        ramp2Mesh.castShadow = true;
        ramp2Mesh.receiveShadow = true;
        scene.add(ramp2Mesh);
        obstacles.push(ramp2Mesh);

        // Add 12 decorative grid towers/houses in bounds
        const towerGeo = new THREE.BoxGeometry(6, 12, 6);
        const towerMat = new THREE.MeshStandardMaterial({ 
            color: 0x111524, 
            roughness: 0.9,
            metalness: 0.1
        });
        
        const towerPositions = [
            [-50, -50], [50, 50], [-70, 70], [70, -70],
            [-100, -10], [100, 10], [-20, -100], [20, 100],
            [-120, -120], [120, 120], [-130, 20], [130, -20]
        ];

        towerPositions.forEach(tp => {
            let tMesh = new THREE.Mesh(towerGeo, towerMat);
            let ty = getTerrainHeight(tp[0], tp[1]) + 6;
            tMesh.position.set(tp[0], ty, tp[1]);
            tMesh.castShadow = true;
            tMesh.receiveShadow = true;
            
            // Add a neon crown ring at the top
            const ringGeo = new THREE.RingGeometry(3.5, 3.7, 8);
            ringGeo.rotateX(-Math.PI/2);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xA855F7, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.y = 6.1;
            tMesh.add(ring);
            
            scene.add(tMesh);
            obstacles.push(tMesh);
        });
    }

    function buildVehicleMesh() {
        carChassis = new THREE.Group();
        scene.add(carChassis);

        let color = physicsConfig.color;

        // Chassis body - converted to nonIndexed for structural damage dent vertex displacement
        let bodyGeo = new THREE.BoxGeometry(2.4, 0.8, 4.2);
        bodyGeo = bodyGeo.toNonIndexed(); // allows separate triangle vertex manipulations
        
        const bodyMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.15,
            metalness: 0.8
        });
        bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        carChassis.add(bodyMesh);

        // Store original vertices clone
        chassisOriginalVertices = [];
        const posAttr = bodyMesh.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            chassisOriginalVertices.push(new THREE.Vector3(
                posAttr.getX(i),
                posAttr.getY(i),
                posAttr.getZ(i)
            ));
        }

        // Cabin cockpit (glass)
        const cabGeo = new THREE.BoxGeometry(1.8, 0.6, 2.2);
        const cabMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.75
        });
        const cabMesh = new THREE.Mesh(cabGeo, cabMat);
        cabMesh.position.set(0, 0.7, -0.2);
        cabMesh.castShadow = true;
        carChassis.add(cabMesh);

        // Headlights (glowing)
        const lightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftHead = new THREE.Mesh(lightGeo, lightMat);
        leftHead.position.set(0.9, 0.1, 2.11);
        const rightHead = leftHead.clone();
        rightHead.position.x = -0.9;
        carChassis.add(leftHead);
        carChassis.add(rightHead);

        // Tail lights (red)
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
        const leftTail = new THREE.Mesh(lightGeo, tailMat);
        leftTail.position.set(0.9, 0.1, -2.11);
        const rightTail = leftTail.clone();
        rightTail.position.x = -0.9;
        carChassis.add(leftTail);
        carChassis.add(rightTail);

        // Build 4 wheels
        wheels = [];
        const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 12);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x080c10, roughness: 0.9 });

        // Wheel offsets: Front-Left, Front-Right, Rear-Left, Rear-Right
        const offsets = [
            new THREE.Vector3(1.25, -physicsConfig.clearance, 1.8),
            new THREE.Vector3(-1.25, -physicsConfig.clearance, 1.8),
            new THREE.Vector3(1.25, -physicsConfig.clearance, -1.8),
            new THREE.Vector3(-1.25, -physicsConfig.clearance, -1.8)
        ];

        for (let i = 0; i < 4; i++) {
            const wheelJoint = new THREE.Group();
            wheelJoint.position.copy(offsets[i]);
            
            const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
            wMesh.castShadow = true;
            wheelJoint.add(wMesh);
            carChassis.add(wheelJoint);
            wheels.push(wheelJoint);
        }
    }

    function buildRaceCheckpoints() {
        checkpoints = [];
        const checkpointCoords = [
            new THREE.Vector3(0, 0, -45),    // Checkpoint 1 (Near start)
            new THREE.Vector3(32.5, 0, -75), // Checkpoint 2 (Over Ramp 1)
            new THREE.Vector3(90, 0, 10),    // Checkpoint 3 (Far East Loop)
            new THREE.Vector3(-10, 0, 95),   // Checkpoint 4 (South Loop)
            new THREE.Vector3(-42.5, 0, 20), // Checkpoint 5 (Over Ramp 2)
            new THREE.Vector3(-110, 0, -50)  // Checkpoint 6 (West Loop back)
        ];

        checkpointCoords.forEach((coord, index) => {
            const ringGeo = new THREE.TorusGeometry(5.5, 0.4, 8, 24);
            ringGeo.rotateY(Math.PI/2); // Align parallel to roadway direction
            
            let color = index === 0 ? 0x10B981 : 0xA855F7; // green active, purple inactive
            const ringMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: index === 0 ? 1.5 : 0.25,
                roughness: 0.3,
                transparent: true,
                opacity: 0.65,
                wireframe: true
            });
            
            let cy = getTerrainHeight(coord.x, coord.z) + 3;
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.position.set(coord.x, cy, coord.z);
            scene.add(ringMesh);
            checkpoints.push(ringMesh);
        });

        if (hudCheckpointsVal) {
            hudCheckpointsVal.textContent = `0 / ${checkpoints.length}`;
        }
    }

    function buildParticles() {
        particleGeometry = new THREE.BufferGeometry();
        let particlePositions = new Float32Array(maxParticles * 3);
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        particleMaterial = new THREE.PointsMaterial({
            color: 0x10B981,
            size: 0.5,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
        activeParticles = [];
    }

    function buildWheelParticles() {
        wheelParticleGeo = new THREE.BufferGeometry();
        let positions = new Float32Array(maxWheelParticles * 3);
        let colors = new Float32Array(maxWheelParticles * 3);
        
        // Hide out of bounds initially
        for (let i = 0; i < maxWheelParticles; i++) {
            positions[i*3] = 9999;
            positions[i*3+1] = 9999;
            positions[i*3+2] = 9999;
        }

        wheelParticleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        wheelParticleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        wheelParticleMat = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.NormalBlending
        });

        wheelParticleSystem = new THREE.Points(wheelParticleGeo, wheelParticleMat);
        scene.add(wheelParticleSystem);
        wheelParticles = [];
    }

    function triggerParticleSplash(origin) {
        activeParticles = [];
        const positions = particleGeometry.attributes.position.array;
        
        let color = nextCheckpointIndex === 0 ? 0xA855F7 : 0x10B981; // match cleared checkpoint color
        particleMaterial.color.setHex(color);

        for (let i = 0; i < maxParticles; i++) {
            let px = origin.x + (Math.random() - 0.5) * 4;
            let py = origin.y + (Math.random() - 0.5) * 4;
            let pz = origin.z + (Math.random() - 0.5) * 4;
            
            positions[i * 3] = px;
            positions[i * 3 + 1] = py;
            positions[i * 3 + 2] = pz;

            activeParticles.push({
                index: i,
                velX: (Math.random() - 0.5) * 15,
                velY: (Math.random() - 0.2) * 18,
                velZ: (Math.random() - 0.5) * 15,
                life: 1.0
            });
        }
        particleGeometry.attributes.position.needsUpdate = true;
    }

    function emitWheelParticles(posL, posR, isOffRoad, speed) {
        const positions = wheelParticleGeo.attributes.position.array;
        const colors = wheelParticleGeo.attributes.color.array;
        
        // Spawn 2 particles from wheels
        for (let wheelIndex = 0; wheelIndex < 2; wheelIndex++) {
            let spawnPos = wheelIndex === 0 ? posL : posR;
            
            // Find slot
            let slot = -1;
            for (let i = 0; i < maxWheelParticles; i++) {
                if (!wheelParticles[i] || wheelParticles[i].life <= 0) {
                    slot = i;
                    break;
                }
            }
            if (slot === -1) continue;

            positions[slot * 3] = spawnPos.x;
            positions[slot * 3 + 1] = spawnPos.y - 0.2;
            positions[slot * 3 + 2] = spawnPos.z;

            // Colors: Gray for drift smoke, Brown for terrain dust
            if (isOffRoad) {
                colors[slot * 3] = 0.45;     // R
                colors[slot * 3 + 1] = 0.35; // G
                colors[slot * 3 + 2] = 0.25; // B
            } else {
                colors[slot * 3] = 0.65;     // R
                colors[slot * 3 + 1] = 0.65; // G
                colors[slot * 3 + 2] = 0.65; // B
            }

            wheelParticles[slot] = {
                index: slot,
                velX: -Math.sin(heading) * speed * 0.4 + (Math.random() - 0.5) * 2,
                velY: Math.random() * 2 + 1,
                velZ: -Math.cos(heading) * speed * 0.4 + (Math.random() - 0.5) * 2,
                life: 1.0,
                isOffRoad: isOffRoad
            };
        }
        wheelParticleGeo.attributes.position.needsUpdate = true;
        wheelParticleGeo.attributes.color.needsUpdate = true;
    }

    function updateWheelParticles(dt) {
        const positions = wheelParticleGeo.attributes.position.array;
        
        for (let i = 0; i < maxWheelParticles; i++) {
            let wp = wheelParticles[i];
            if (wp && wp.life > 0) {
                positions[wp.index * 3] += wp.velX * dt;
                positions[wp.index * 3 + 1] += wp.velY * dt;
                positions[wp.index * 3 + 2] += wp.velZ * dt;
                
                // Add wind drift
                wp.velX += 0.5 * dt;
                wp.velZ += 0.5 * dt;
                wp.life -= dt * (wp.isOffRoad ? 1.6 : 1.2); // dust decays faster
                
                if (wp.life <= 0) {
                    positions[wp.index * 3] = 9999;
                    positions[wp.index * 3 + 1] = 9999;
                    positions[wp.index * 3 + 2] = 9999;
                }
            }
        }
        wheelParticleGeo.attributes.position.needsUpdate = true;
    }

    function spawnWaterRipple(wPos) {
        // Recycle flat ring geometry meshes
        let rippleMesh = null;
        
        // Try finding inactive ring
        for (let i = 0; i < wakeRings.length; i++) {
            if (wakeRings[i].opacity <= 0) {
                rippleMesh = wakeRings[i];
                break;
            }
        }

        if (!rippleMesh) {
            if (wakeRings.length >= maxWakeRings) return;
            
            // Create a flat ring geometry flat on Y
            const ringGeo = new THREE.RingGeometry(0.8, 1.0, 16);
            ringGeo.rotateX(-Math.PI / 2);
            
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x93c5fd,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            
            rippleMesh = new THREE.Mesh(ringGeo, ringMat);
            scene.add(rippleMesh);
            wakeRings.push(rippleMesh);
        }

        rippleMesh.position.set(wPos.x, -2.08, wPos.z); // sit just above water plane
        rippleMesh.scale.set(1.0, 1.0, 1.0);
        rippleMesh.material.opacity = 0.45;
        rippleMesh.opacity = 0.45; // custom prop
    }

    function updateWaterRipples(dt) {
        wakeRings.forEach(ring => {
            if (ring.opacity > 0) {
                ring.scale.x += dt * 3.5;
                ring.scale.z += dt * 3.5;
                ring.opacity -= dt * 0.7;
                ring.material.opacity = Math.max(0, ring.opacity);
                
                if (ring.opacity <= 0) {
                    ring.position.set(9999, 9999, 9999);
                }
            }
        });
    }

    function updateParticles(dt) {
        if (activeParticles.length === 0) return;
        
        const positions = particleGeometry.attributes.position.array;
        let aliveCount = 0;

        activeParticles.forEach(p => {
            if (p.life > 0) {
                positions[p.index * 3] += p.velX * dt;
                positions[p.index * 3 + 1] += p.velY * dt;
                positions[p.index * 3 + 2] += p.velZ * dt;
                
                // Add gravity pull
                p.velY -= 9.8 * dt;
                p.life -= dt * 1.5; // decay life
                aliveCount++;
            }
        });

        if (aliveCount > 0) {
            particleGeometry.attributes.position.needsUpdate = true;
            particleMaterial.opacity = Math.max(0, activeParticles[0].life);
        } else {
            activeParticles = [];
        }
    }

    // Key handlers
    function handleKeyDown(e) {
        const keyMap = {
            KeyW: 'w', ArrowUp: 'w',
            KeyS: 's', ArrowDown: 's',
            KeyA: 'a', ArrowLeft: 'a',
            KeyD: 'd', ArrowRight: 'd',
            Space: 'space',
            KeyR: 'r',
            KeyM: 'm'
        };
        const action = keyMap[e.code];
        if (action) {
            keys[action] = true;
            if (e.code === "Space") e.preventDefault(); // prevent scroll
        }
    }

    function handleKeyUp(e) {
        const keyMap = {
            KeyW: 'w', ArrowUp: 'w',
            KeyS: 's', ArrowDown: 's',
            KeyA: 'a', ArrowLeft: 'a',
            KeyD: 'd', ArrowRight: 'd',
            Space: 'space',
            KeyR: 'r',
            KeyM: 'm'
        };
        const action = keyMap[e.code];
        if (action) {
            keys[action] = false;
        }
    }

    // Main physics loop (dt is time delta)
    let lastTime = 0;
    
    function animateSimulator(time) {
        if (!isInitialized) return;
        animationFrameId = requestAnimationFrame(animateSimulator);
        
        if (!time) time = performance.now();
        let dt = (time - lastTime) / 1000;
        lastTime = time;

        if (dt <= 0 || dt > 0.1) dt = 0.016; // clamp framing errors

        updateAtmosphere(time);
        updateVehiclePhysics(dt);
        updateCheckpointsDetection();
        updateParticles(dt);
        updateWheelParticles(dt);
        updateWaterRipples(dt);
        updateRainParticles(dt);
        updateAudio(dt);
        render3DScene();
        drawMinimap();
        drawScreenDroplets(dt);
    }

    function updateAtmosphere(time) {
        // Slow rotation of sun angle
        weatherState.sunAngle = (time * weatherState.dayCycleSpeed) % (Math.PI * 2);
        
        let sunCos = Math.cos(weatherState.sunAngle);
        let sunSin = Math.sin(weatherState.sunAngle);

        // Update directional light coordinates
        sunLight.position.set(sunSin * 90, sunCos * 90 + 20, sunCos * 30);

        // Compute day cycle values (noon = 1.0, night = 0.0)
        let dayPct = Math.max(0, sunCos);
        sunLight.intensity = dayPct * 1.35;
        
        // Transition fog and ambient hues
        let ambientVal = 0.06 + dayPct * 0.34;
        ambientLight.color.setHSL(0.55, 0.35, ambientVal);
        
        let dayFogColor = new THREE.Color(weatherState.isStorm ? 0x07090f : 0x0a0d1a);
        let nightFogColor = new THREE.Color(0x010204);
        let currentFogColor = nightFogColor.clone().lerp(dayFogColor, dayPct);
        
        scene.fog.color.copy(currentFogColor);
        renderer.setClearColor(currentFogColor);
    }

    function updateRainParticles(dt) {
        if (!weatherState.rainSystem) return;

        const positions = weatherState.rainSystem.geometry.attributes.position.array;
        const count = weatherState.rainMaxParticles;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] -= dt * 26.0; // fall down fast
            
            // wrap boundary relative to car coordinates
            let px = positions[i * 3] + camera.position.x;
            let pz = positions[i * 3 + 2] + camera.position.z;
            let py = positions[i * 3 + 1];
            let gH = getTerrainHeight(px, pz);

            if (py < gH) {
                // reset particle
                positions[i * 3] = (Math.random() - 0.5) * 80;
                positions[i * 3 + 1] = camera.position.y + 25 + Math.random() * 15;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            }
        }
        weatherState.rainSystem.geometry.attributes.position.needsUpdate = true;
        
        // Center rain cloud coordinates over camera
        weatherState.rainSystem.position.set(camera.position.x, 0, camera.position.z);
    }

    function checkCollisionImpulses() {
        if (vel.length() * 3.6 < 14) return; // ignore minor bumps
        
        // Chassis bounding center
        let chassisBox = new THREE.Box3().setFromObject(bodyMesh);
        let collideObstacle = null;
        let collideDist = 9999;

        // Verify distance against obstacles
        obstacles.forEach(obs => {
            // Check approximate distance
            let dist = pos.distanceTo(obs.position);
            if (dist < 8.0 && dist < collideDist) {
                collideDist = dist;
                collideObstacle = obs;
            }
        });

        if (collideObstacle && collideDist < 4.8) {
            let impactVec = vel.clone().normalize().negate();
            let impulse = vel.length() * 0.06;
            
            // Trigger metallic crunch synth noise
            playCollisionSound();

            // Accumulate Structural Damage
            cumulativeDamage = Math.min(100, cumulativeDamage + impulse * 9);
            
            // HUD updates
            if (hudDamageVal) hudDamageVal.textContent = `${Math.round(cumulativeDamage)}%`;
            if (hudDamageFill) hudDamageFill.style.width = `${Math.round(cumulativeDamage)}%`;

            // Displace chassis geometry vertices (soft-body denting)
            let localImpact = bodyMesh.worldToLocal(collideObstacle.position.clone());
            let posAttr = bodyMesh.geometry.attributes.position;
            
            for (let i = 0; i < posAttr.count; i++) {
                let vx = posAttr.getX(i);
                let vy = posAttr.getY(i);
                let vz = posAttr.getZ(i);
                let dist = localImpact.distanceTo(new THREE.Vector3(vx, vy, vz));

                if (dist < 2.0) {
                    // Push vertex inward toward local center (0,0,0)
                    let pushDir = new THREE.Vector3(0, 0, 0).sub(localImpact).normalize();
                    let dentAmt = (2.0 - dist) * impulse * 0.40;
                    
                    posAttr.setXYZ(
                        i,
                        vx + pushDir.x * dentAmt,
                        vy + pushDir.y * dentAmt,
                        vz + pushDir.z * dentAmt
                    );
                }
            }
            posAttr.needsUpdate = true;
            bodyMesh.geometry.computeVertexNormals();

            // Reverse velocity bounce impulse
            vel.multiplyScalar(-0.35); 
        }
    }

    function resetDamage() {
        if (!isInitialized || !bodyMesh) return;
        
        let posAttr = bodyMesh.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            let orig = chassisOriginalVertices[i];
            posAttr.setXYZ(i, orig.x, orig.y, orig.z);
        }
        posAttr.needsUpdate = true;
        bodyMesh.geometry.computeVertexNormals();

        cumulativeDamage = 0;
        
        if (hudDamageVal) hudDamageVal.textContent = "0%";
        if (hudDamageFill) hudDamageFill.style.width = "0%";
    }

    function updateVehiclePhysics(dt) {
        const config = physicsConfig;
        
        // 1. Repair check
        if (keys.m) {
            resetDamage();
            keys.m = false;
        }

        // Reset check
        if (keys.r) {
            pos.set(0, getTerrainHeight(0, 0) + 2, 0);
            vel.set(0, 0, 0);
            heading = 0;
            pitch = 0;
            roll = 0;
            yawVel = 0;
            gear = "D";
            keys.r = false;
        }

        // 2. Determine airborne states
        let groundH = getTerrainHeight(pos.x, pos.z);
        isAirborne = pos.y > groundH + config.clearance + 0.05;

        // 3. Process key controls & Drivetrain gear shifts
        let steerInput = 0;
        if (keys.a) steerInput += 1;
        if (keys.d) steerInput -= 1;

        let throttleInput = keys.w ? 1.0 : 0.0;
        let brakeInput = keys.s ? 1.0 : 0.0;

        // Drivetrain Gear logic
        let fwdSpeed = vel.dot(new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading)));

        if (gear === "D") {
            if (fwdSpeed < 0.05 && brakeInput > 0) {
                gear = "R";
            }
        } else if (gear === "R") {
            if (fwdSpeed > -0.05 && throttleInput > 0) {
                gear = "D";
            }
        }

        // Apply forces based on gear
        let engineForce = 0;
        let brakingForce = 0;

        if (gear === "D") {
            engineForce = throttleInput * config.maxEngineForce;
            brakingForce = brakeInput * config.maxEngineForce * 1.5;
        } else {
            // S key acts as reverse throttle, W key acts as reverse brake
            engineForce = -brakeInput * config.maxEngineForce * 0.5; // slower reverse speed
            brakingForce = throttleInput * config.maxEngineForce * 1.5;
        }

        // Dynamic steering Pull based on structural damage
        let damageSteeringPull = (cumulativeDamage / 100) * 0.12 * steerPullSign;

        // 4. Update steering and tire slip
        let targetSteering = steerInput * 0.55 * config.steeringRatio + damageSteeringPull;
        let currentSteer = wheels[0] ? wheels[0].rotation.y : 0;
        let steerLerp = currentSteer + (targetSteering - currentSteer) * dt * 9;
        
        // Rotate front wheels visually for steering
        if (wheels[0]) wheels[0].rotation.y = steerLerp;
        if (wheels[1]) wheels[1].rotation.y = steerLerp;

        // 5. Custom Pacejka Slip & Drift model
        let isDrifting = keys.space && Math.abs(fwdSpeed) > 10;
        
        // Lower friction coefficient (μ) by 40% when rain is active (hydroplaning)
        let rainFrictionFactor = weatherState.isStorm ? 0.60 : 1.0;
        let slipFriction = config.friction * rainFrictionFactor;
        
        if (isDrifting) {
            slipFriction *= 0.30; // drop lateral friction
            yawVel += steerInput * dt * 2.85; 
        } else {
            // Normal stabilizing friction
            yawVel += steerInput * (fwdSpeed / 30) * dt * 1.8;
            yawVel *= 0.90; // yaw damping
        }

        // Apply heading update
        heading += yawVel * dt * 1.8;

        // 6. Longitudinal force updates (Engine - Braking - Drag)
        let forwardVec = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
        let lateralVec = new THREE.Vector3(Math.cos(heading), 0, -Math.sin(heading));

        let currentFwdSpeed = vel.dot(forwardVec);
        let currentLatSpeed = vel.dot(lateralVec);

        let totalFwdForce = engineForce;
        // Brake opposes movement
        if (currentFwdSpeed > 0.05) {
            totalFwdForce -= brakingForce;
        } else if (currentFwdSpeed < -0.05) {
            totalFwdForce += brakingForce;
        }

        // Aerodynamic Drag & Rolling Resistance
        let dragForce = -0.5 * 0.32 * 1.2 * 3.5 * currentFwdSpeed * Math.abs(currentFwdSpeed);
        let rollingResistanceForce = -0.015 * config.mass * 9.8 * Math.sign(currentFwdSpeed);
        totalFwdForce += dragForce + rollingResistanceForce;

        let fwdAccel = totalFwdForce / config.mass;
        let newFwdSpeed = currentFwdSpeed + fwdAccel * dt;

        // Lateral Force: Stabilizes sideways sliding (Slip correction)
        let totalLatForce = -currentLatSpeed * config.mass * 5.0 * slipFriction;
        let latAccel = totalLatForce / config.mass;
        let newLatSpeed = currentLatSpeed + latAccel * dt;

        // 7. Suspension forces (Hooke's Law updates)
        updateSuspensionForces(dt);

        // 8. Vertical updates (Airborne vs ground constraints)
        let newYVel = vel.y;
        if (isAirborne) {
            // Apply gravity
            newYVel -= 9.81 * dt;
            
            // Aerodynamic Pitch torque: W/S inputs pitch nose forward/back
            let pitchTorque = (throttleInput - brakeInput) * dt * 1.2;
            pitch += pitchTorque;
            pitch *= 0.97; // damping rotation
        } else {
            // Snap to ground clearance
            pos.y = groundH + config.clearance;
            newYVel = 0;
            
            // Match pitch and roll to terrain normal slope
            let sampleDist = 1.5;
            let hF = getTerrainHeight(pos.x + Math.sin(heading) * sampleDist, pos.z + Math.cos(heading) * sampleDist);
            let hB = getTerrainHeight(pos.x - Math.sin(heading) * sampleDist, pos.z - Math.cos(heading) * sampleDist);
            let hL = getTerrainHeight(pos.x + Math.cos(heading) * sampleDist, pos.z - Math.sin(heading) * sampleDist);
            let hR = getTerrainHeight(pos.x - Math.cos(heading) * sampleDist, pos.z + Math.sin(heading) * sampleDist);

            pitch = Math.atan2(hF - hB, sampleDist * 2);
            roll = Math.atan2(hL - hR, sampleDist * 2);
        }

        // 9. Recompose global velocity vector
        vel.copy(forwardVec).multiplyScalar(newFwdSpeed)
           .add(lateralVec.clone().multiplyScalar(newLatSpeed));
        vel.y = newYVel;

        // Update position
        pos.addScaledVector(vel, dt);

        // Out-of-bounds containment (loop map boundaries)
        const borderLimit = 160;
        if (Math.abs(pos.x) > borderLimit) {
            pos.x = Math.sign(pos.x) * borderLimit;
            vel.x = 0;
        }
        if (Math.abs(pos.z) > borderLimit) {
            pos.z = Math.sign(pos.z) * borderLimit;
            vel.z = 0;
        }

        // Check for collision damages
        checkCollisionImpulses();

        // 10. Process tyre particle emitters
        let isOffRoad = pos.y > -2.0 && getTerrainHeight(pos.x, pos.z) > -1.8; // simple offroad test
        let speedMag = vel.length();

        // Generate drift smoke or terrain dust
        if (speedMag > 3.0 && !isAirborne) {
            // Rear wheels attachment positions
            let offsetL = new THREE.Vector3(1.25, -config.clearance, -1.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading).add(pos);
            let offsetR = new THREE.Vector3(-1.25, -config.clearance, -1.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading).add(pos);

            if (isDrifting || (keys.w && speedMag < 8)) {
                // Emit asphalt gray smoke
                emitWheelParticles(offsetL, offsetR, false, speedMag);
            } else if (isOffRoad && speedMag > 8) {
                // Emit brown dirt dust
                emitWheelParticles(offsetL, offsetR, true, speedMag);
            }
        }

        // 11. Water zones fluid wake ripples
        if (pos.y < -1.8 && speedMag > 2.0) {
            let offsetRear = new THREE.Vector3(0, -config.clearance, -1.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading).add(pos);
            if (Math.random() < 0.22) {
                spawnWaterRipple(offsetRear);
            }
        }

        // Apply transforms to 3D meshes
        carChassis.position.copy(pos);
        carChassis.rotation.set(0, heading, 0);
        carChassis.rotateX(pitch);
        carChassis.rotateZ(roll);

        // Spin wheels visually based on travel speed
        let wheelRotateSpeed = (newFwdSpeed / 0.55) * dt;
        wheels.forEach(w => {
            w.children[0].rotateY(wheelRotateSpeed);
        });

        // 12. Update Telemetry HUD displays
        updateTelemetryHUD(newFwdSpeed);
    }

    function updateTelemetryHUD(fwdSpeed) {
        // Digital Speedometer (KM/H)
        let kmh = Math.round(Math.abs(fwdSpeed) * 3.6);
        if (hudSpeedVal) hudSpeedVal.textContent = kmh;
        
        // Gear display
        if (hudGearVal) hudGearVal.textContent = gear;

        // RPM simulator based on velocity & throttle
        let maxRpm = 7000;
        let baseRpm = 1000;
        let speedPct = Math.abs(fwdSpeed) / 45; // ~160 KM/H max gear speed pct
        
        // Mock 4 gear shifts
        let gearNum = Math.floor(speedPct * 4) + 1;
        gearNum = Math.min(Math.max(gearNum, 1), 4);
        
        let gearSpeedRange = 45 / 4;
        let gearFwdSpeed = Math.abs(fwdSpeed) % gearSpeedRange;
        let gearSpeedPct = gearFwdSpeed / gearSpeedRange;

        rpm = baseRpm + (gearSpeedPct * 4500) + (keys.w ? 1200 : 0);
        rpm = Math.min(Math.max(Math.round(rpm), 1000), maxRpm);

        if (hudRpmVal) hudRpmVal.textContent = rpm;
        if (hudRpmFill) {
            let pct = (rpm - 1000) / (maxRpm - 1000) * 100;
            hudRpmFill.style.width = `${Math.min(Math.max(pct, 5), 100)}%`;
            
            // Flash red on redline
            if (rpm > 6500) {
                hudRpmFill.style.background = "#EF4444";
            } else {
                hudRpmFill.style.background = "linear-gradient(90deg, var(--color-cyan), var(--color-purple))";
            }
        }

        // Split Timer
        let elapsed = Date.now() - raceStartTime;
        let m = Math.floor(elapsed / 60000);
        let s = Math.floor((elapsed % 60000) / 1000);
        let ms = Math.floor((elapsed % 1000) / 10);
        
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        ms = ms < 10 ? "0" + ms : ms;

        if (hudTimerVal) {
            hudTimerVal.textContent = `${m}:${s}.${ms}`;
        }
    }

    function updateCheckpointsDetection() {
        if (checkpoints.length === 0) return;

        let activeRing = checkpoints[nextCheckpointIndex];
        let distance = pos.distanceTo(activeRing.position);

        // Collision threshold (7.5m sphere overlapping ring center)
        if (distance < 7.5) {
            // Trigger splash explosion
            triggerParticleSplash(activeRing.position);
            
            // Log split time
            let elapsed = (Date.now() - raceStartTime) / 1000;
            checkpointTimes.push(elapsed);
            
            if (splitToast && splitToastTime) {
                splitToastTime.textContent = `+${elapsed.toFixed(2)}s`;
                splitToast.style.display = "flex";
                setTimeout(() => {
                    splitToast.style.display = "none";
                }, 2200);
            }

            // Deactivate current ring glow
            activeRing.material.emissiveIntensity = 0.25;
            activeRing.material.color.setHex(0xA855F7);
            
            // Advance index
            nextCheckpointIndex = (nextCheckpointIndex + 1) % checkpoints.length;

            // Activate next ring glow
            let nextRing = checkpoints[nextCheckpointIndex];
            nextRing.material.emissiveIntensity = 1.5;
            nextRing.material.color.setHex(0x10B981);

            if (hudCheckpointsVal) {
                hudCheckpointsVal.textContent = `${checkpointTimes.length} / ${checkpoints.length}`;
            }

            // Finish loop: reset timer
            if (checkpointTimes.length === checkpoints.length) {
                raceStartTime = Date.now();
                checkpointTimes = [];
                if (hudCheckpointsVal) {
                    hudCheckpointsVal.textContent = `0 / ${checkpoints.length}`;
                }
            }
        }
        
        // Spin active ring slowly for visual juice
        activeRing.rotation.z += 0.015;
    }

    function drawMinimap() {
        if (!minimapCtx || checkpoints.length === 0) return;
        
        const ctx = minimapCtx;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;
        const scale = 0.42; // scale world coords to fit canvas

        ctx.clearRect(0, 0, w, h);
        
        // Save state and center coordinate grid on the vehicle position
        ctx.save();
        ctx.translate(w / 2, h / 2);
        
        // Draw world borders
        ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-160 * scale, -160 * scale, 320 * scale, 320 * scale);

        // Draw checkpoint connectors (race path vector)
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        for (let i = 0; i < checkpoints.length; i++) {
            let cx = checkpoints[i].position.x * scale;
            let cz = checkpoints[i].position.z * scale;
            if (i === 0) ctx.moveTo(cx, cz);
            else ctx.lineTo(cx, cz);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Checkpoints
        checkpoints.forEach((ring, index) => {
            let cx = ring.position.x * scale;
            let cz = ring.position.z * scale;
            
            ctx.beginPath();
            ctx.arc(cx, cz, 4, 0, Math.PI * 2);
            ctx.fillStyle = index === nextCheckpointIndex ? "#10B981" : "#A855F7";
            ctx.fill();
            
            if (index === nextCheckpointIndex) {
                // Pulse glow outer ring
                ctx.beginPath();
                ctx.arc(cx, cz, 8 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
                ctx.stroke();
            }
        });

        // Draw other static obstacle towers
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        obstacles.forEach(obs => {
            if (obs.geometry.type === "BoxGeometry" && obs.scale.x > 1) { // skip ramps
                let ox = obs.position.x * scale;
                let oz = obs.position.z * scale;
                ctx.fillRect(ox - 2, oz - 2, 4, 4);
            }
        });

        // Draw Player chassis heading triangle at center (0,0 relative since grid translates)
        ctx.restore();
        
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-heading); // rotate to match car yaw heading

        ctx.beginPath();
        ctx.moveTo(0, -7);   // Top nose
        ctx.lineTo(-5, 6);   // Rear left
        ctx.lineTo(5, 6);    // Rear right
        ctx.closePath();
        
        let pColor = selectedVehicleType === "race" ? "#10B981" : 
                     selectedVehicleType === "suv" ? "#F97316" : 
                     selectedVehicleType === "jeep" ? "#14B8A6" : "#A855F7";
        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }

    function spawnScreenDroplet() {
        if (!dropletCanvas || screenDroplets.length >= 22) return;
        screenDroplets.push({
            x: Math.random() * dropletCanvas.width,
            y: Math.random() * -10,
            vy: Math.random() * 2.8 + 1.2,
            size: Math.random() * 2.5 + 1.5,
            life: 1.0
        });
    }

    function drawScreenDroplets(dt) {
        if (!dropletCtx || !dropletCanvas) return;
        
        const ctx = dropletCtx;
        ctx.clearRect(0, 0, dropletCanvas.width, dropletCanvas.height);
        
        if (weatherState.isStorm) {
            // Spawn droplets occasionally
            if (Math.random() < 0.15) {
                spawnScreenDroplet();
            }

            screenDroplets.forEach((d, index) => {
                d.y += d.vy * dt * 60;
                
                // Draw drop path vector
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(147, 197, 253, 0.12)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Draw simple refraction glare spot
                ctx.beginPath();
                ctx.arc(d.x - d.size * 0.28, d.y - d.size * 0.28, d.size * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fill();

                if (d.y > dropletCanvas.height) {
                    screenDroplets.splice(index, 1);
                }
            });
        } else {
            // Slow dry out of screen droplets
            if (screenDroplets.length > 0) {
                screenDroplets.forEach((d, index) => {
                    d.size -= dt * 0.5;
                    if (d.size <= 0) screenDroplets.splice(index, 1);
                });
            }
        }
    }

    function render3DScene() {
        if (!renderer || !scene || !camera) return;

        // Third-person camera follow target: follows behind car position
        const followDist = 11;
        const followHeight = 4.5;
        
        // Calculate offset position behind car
        let camTargetX = pos.x - Math.sin(heading) * followDist;
        let camTargetZ = pos.z - Math.cos(heading) * followDist;
        let camTargetY = pos.y + followHeight;

        // Height clamp terrain
        let terrainCamH = getTerrainHeight(camTargetX, camTargetZ) + 1.5;
        camTargetY = Math.max(camTargetY, terrainCamH);

        // Dynamic Camera Shake (linked to speed and ground roughness)
        let shakeFreq = 0;
        let shakeAmp = 0;
        
        if (!isAirborne) {
            let speedKmh = vel.length() * 3.6;
            shakeAmp = (speedKmh / 240) * (0.012 + Math.abs(pitch) * 0.04);
            shakeFreq = Date.now() * 0.055;
        }

        // Smooth camera position follow lerp
        camera.position.x += (camTargetX - camera.position.x) * 0.12;
        camera.position.y += (camTargetY - camera.position.y) * 0.12;
        camera.position.z += (camTargetZ - camera.position.z) * 0.12;

        // Add camera shaking vibration offset
        if (shakeAmp > 0) {
            camera.position.x += Math.sin(shakeFreq) * shakeAmp;
            camera.position.y += Math.cos(shakeFreq * 1.2) * shakeAmp;
        }

        // Camera looks slightly ahead of car
        let lookTarget = pos.clone().add(new THREE.Vector3(Math.sin(heading) * 3, 0, Math.cos(heading) * 3));
        camera.lookAt(lookTarget);

        // Cinematic Field of View (FOV) dynamic stretching
        let isDrifting = keys.space && vel.length() > 3.5;
        let targetFov = 60 + (vel.length() / 45) * 22 + (isDrifting ? 8 : 0);
        camera.fov += (targetFov - camera.fov) * 0.08;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
    }

    function cleanSandboxEngine() {
        isInitialized = false;
        cancelAnimationFrame(animationFrameId);
        
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);

        if (stormToggle) {
            stormToggle.removeEventListener("change", handleStormToggle);
        }

        if (dropletCanvas) {
            dropletCanvas.parentNode.removeChild(dropletCanvas);
            dropletCanvas = null;
            dropletCtx = null;
        }

        // Dispose sound synthesizer
        if (audioCtx) {
            try {
                if (engineOsc1) engineOsc1.stop();
                if (engineOsc2) engineOsc2.stop();
                if (screechOsc) screechOsc.stop();
                audioCtx.close();
            } catch (e) {}
            audioCtx = null;
            engineOsc1 = null; engineOsc2 = null;
            screechOsc = null;
        }

        if (renderer) {
            renderer.dispose();
            renderer = null;
        }

        // Dispose geometries & materials
        if (scene) {
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            scene = null;
        }
        camera = null;
        carChassis = null;
        wheels = [];
        checkpoints = [];
        checkpointTimes = [];
        wakeRings = [];
    }

    // Modal Trigger Binds
    const btnProjectSandbox = document.getElementById("btn-project-sandbox");
    if (btnProjectSandbox) {
        btnProjectSandbox.addEventListener("click", () => {
            // Reset overlay screen state
            garageOverlay.style.display = "flex";
            simulatorContainer.style.display = "none";
        });
    }

    if (btnLaunchEngine) {
        btnLaunchEngine.addEventListener("click", () => {
            garageOverlay.style.display = "none";
            simulatorContainer.style.display = "block";
            
            // Run engine initialization
            setTimeout(() => {
                initSandboxEngine();
            }, 100);
        });
    }

    if (btnCloseSandbox) {
        btnCloseSandbox.addEventListener("click", () => {
            cleanSandboxEngine();
        });
    }

    // Ensure resizing handles canvas scaling
    window.addEventListener("resize", () => {
        if (!isInitialized || !renderer || !camera) return;
        const canvas = document.getElementById("sandboxCanvas");
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
});
