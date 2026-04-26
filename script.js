 // ============================
        // DATA & STATE
        // ============================
        let currentUser = null;
        let currentProfile = null;
        let currentLogs = [];
        let currentStep = 1;

        // Activity multipliers
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725
        };

        // ============================
        // AUTH SYSTEM
        // ============================
        function toggleAuth() {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            if (loginForm.style.display === 'none') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
            clearErrors();
        }

        function clearErrors() {
            document.getElementById('loginError').style.display = 'none';
            document.getElementById('regError').style.display = 'none';
            document.getElementById('regSuccess').style.display = 'none';
        }

        function getUsers() {
            const users = localStorage.getItem('vitalfit_users');
            return users ? JSON.parse(users) : {};
        }

        function saveUsers(users) {
            localStorage.setItem('vitalfit_users', JSON.stringify(users));
        }

        function register() {
            clearErrors();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirm').value;

            if (!name || !email || !password || !confirm) {
                showRegError('Please fill in all fields.');
                return;
            }
            if (password.length < 6) {
                showRegError('Password must be at least 6 characters.');
                return;
            }
            if (password !== confirm) {
                showRegError('Passwords do not match.');
                return;
            }

            const users = getUsers();
            if (users[email]) {
                showRegError('An account with this email already exists.');
                return;
            }

            users[email] = {
                name: name,
                email: email,
                password: password
            };
            saveUsers(users);

            const successDiv = document.getElementById('regSuccess');
            successDiv.textContent = 'Account created! Please sign in.';
            successDiv.style.display = 'block';

            setTimeout(() => {
                toggleAuth();
            }, 1500);
        }

        function showRegError(msg) {
            const errDiv = document.getElementById('regError');
            errDiv.textContent = msg;
            errDiv.style.display = 'block';
        }

        function login() {
            clearErrors();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showLoginError('Please enter email and password.');
                return;
            }

            const users = getUsers();
            if (!users[email] || users[email].password !== password) {
                showLoginError('Invalid email or password.');
                return;
            }

            currentUser = users[email];
            localStorage.setItem('vitalfit_current_user', JSON.stringify(currentUser));
            showDashboard();
        }

        function showLoginError(msg) {
            const errDiv = document.getElementById('loginError');
            errDiv.textContent = msg;
            errDiv.style.display = 'block';
        }

        function logout() {
            currentUser = null;
            currentProfile = null;
            currentLogs = [];
            localStorage.removeItem('vitalfit_current_user');
            location.reload();
        }

        function checkAuth() {
            const saved = localStorage.getItem('vitalfit_current_user');
            if (saved) {
                currentUser = JSON.parse(saved);
                showDashboard();
            }
        }

        // ============================
        // DASHBOARD DISPLAY
        // ============================
        function showDashboard() {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainNav').style.display = 'flex';
            document.getElementById('dashboardSection').classList.add('active');

            document.getElementById('navUserName').textContent = currentUser.name;
            document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

            loadProfile();
            if (!currentProfile) {
                const modal = new bootstrap.Modal(document.getElementById('onboardingModal'));
                modal.show();
            } else {
                renderDashboard();
            }
        }

        // ============================
        // ONBOARDING WIZARD
        // ============================
        function nextStep() {
            if (!validateStep(currentStep)) return;

            if (currentStep < 5) {
                document.getElementById(`step${currentStep}`).classList.remove('active');
                document.getElementById(`step${currentStep}ind`).classList.remove('active');
                document.getElementById(`step${currentStep}ind`).classList.add('completed');
                currentStep++;
                document.getElementById(`step${currentStep}`).classList.add('active');
                document.getElementById(`step${currentStep}ind`).classList.add('active');

                document.getElementById('prevBtn').style.display = 'inline-block';
                if (currentStep === 5) {
                    document.getElementById('nextBtn').textContent = 'Generate My Plan';
                }
            } else {
                saveProfile();
                bootstrap.Modal.getInstance(document.getElementById('onboardingModal')).hide();
                renderDashboard();
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                document.getElementById(`step${currentStep}`).classList.remove('active');
                document.getElementById(`step${currentStep}ind`).classList.remove('active');
                currentStep--;
                document.getElementById(`step${currentStep}`).classList.add('active');
                document.getElementById(`step${currentStep}ind`).classList.remove('completed');
                document.getElementById(`step${currentStep}ind`).classList.add('active');

                document.getElementById('nextBtn').textContent = 'Next';
                if (currentStep === 1) {
                    document.getElementById('prevBtn').style.display = 'none';
                }
            }
        }

        function validateStep(step) {
            if (step === 1) {
                if (!document.getElementById('profName').value.trim()) { alert('Please enter your name.'); return false; }
                if (!document.getElementById('profGender').value) { alert('Please select gender.'); return false; }
                if (!document.getElementById('profAge').value || document.getElementById('profAge').value < 10) { alert('Please enter a valid age.'); return false; }
            }
            if (step === 2) {
                if (!document.getElementById('profWeight').value) { alert('Please enter current weight.'); return false; }
                if (!document.getElementById('profHeight').value) { alert('Please enter height.'); return false; }
                if (!document.getElementById('profTarget').value) { alert('Please enter target weight.'); return false; }
            }
            if (step === 3) {
                if (!document.getElementById('profActivity').value) { alert('Please select activity level.'); return false; }
                if (!document.getElementById('profEnvironment').value) { alert('Please select exercise environment.'); return false; }
            }
            if (step === 4) {
                if (!document.getElementById('profDiet').value) { alert('Please select dietary preference.'); return false; }
            }
            if (step === 5) {
                if (!document.getElementById('profGoal').value) { alert('Please select a fitness goal.'); return false; }
            }
            return true;
        }

        function saveProfile() {
            currentProfile = {
                name: document.getElementById('profName').value.trim(),
                gender: document.getElementById('profGender').value,
                age: parseInt(document.getElementById('profAge').value),
                weight: parseFloat(document.getElementById('profWeight').value),
                height: parseFloat(document.getElementById('profHeight').value),
                targetWeight: parseFloat(document.getElementById('profTarget').value),
                activity: document.getElementById('profActivity').value,
                environment: document.getElementById('profEnvironment').value,
                diet: document.getElementById('profDiet').value,
                allergies: document.getElementById('profAllergies').value.trim(),
                goal: document.getElementById('profGoal').value
            };
            const profiles = JSON.parse(localStorage.getItem('vitalfit_profiles') || '{}');
            profiles[currentUser.email] = currentProfile;
            localStorage.setItem('vitalfit_profiles', JSON.stringify(profiles));
            currentLogs = [];
            saveLogs();
        }

        function loadProfile() {
            const profiles = JSON.parse(localStorage.getItem('vitalfit_profiles') || '{}');
            if (profiles[currentUser.email]) {
                currentProfile = profiles[currentUser.email];
                loadLogs();
            }
        }

        function saveLogs() {
            const allLogs = JSON.parse(localStorage.getItem('vitalfit_logs') || '{}');
            allLogs[currentUser.email] = currentLogs;
            localStorage.setItem('vitalfit_logs', JSON.stringify(allLogs));
        }

        function loadLogs() {
            const allLogs = JSON.parse(localStorage.getItem('vitalfit_logs') || '{}');
            currentLogs = allLogs[currentUser.email] || [];
        }

        function resetPlan() {
            if (confirm('Are you sure you want to reset your plan? This will clear your profile and logs.')) {
                const profiles = JSON.parse(localStorage.getItem('vitalfit_profiles') || '{}');
                delete profiles[currentUser.email];
                localStorage.setItem('vitalfit_profiles', JSON.stringify(profiles));

                const allLogs = JSON.parse(localStorage.getItem('vitalfit_logs') || '{}');
                delete allLogs[currentUser.email];
                localStorage.setItem('vitalfit_logs', JSON.stringify(allLogs));

                currentProfile = null;
                currentLogs = [];
                currentStep = 1;

                // Reset wizard UI
                for (let i = 1; i <= 5; i++) {
                    document.getElementById(`step${i}`).classList.remove('active');
                    document.getElementById(`step${i}ind`).classList.remove('active', 'completed');
                }
                document.getElementById('step1').classList.add('active');
                document.getElementById('step1ind').classList.add('active');
                document.getElementById('prevBtn').style.display = 'none';
                document.getElementById('nextBtn').textContent = 'Next';

                // Clear form fields
                document.getElementById('profName').value = '';
                document.getElementById('profGender').value = '';
                document.getElementById('profAge').value = '';
                document.getElementById('profWeight').value = '';
                document.getElementById('profHeight').value = '';
                document.getElementById('profTarget').value = '';
                document.getElementById('profActivity').value = '';
                document.getElementById('profEnvironment').value = '';
                document.getElementById('profDiet').value = '';
                document.getElementById('profAllergies').value = '';
                document.getElementById('profGoal').value = '';

                const modal = new bootstrap.Modal(document.getElementById('onboardingModal'));
                modal.show();
            }
        }

        // ============================
        // CALCULATIONS
        // ============================
        function calculateBMI(weight, heightCm) {
            const heightM = heightCm / 100;
            return (weight / (heightM * heightM)).toFixed(1);
        }

        function getBMICategory(bmi) {
            if (bmi < 18.5) return 'Underweight';
            if (bmi < 25) return 'Healthy Weight';
            if (bmi < 30) return 'Overweight';
            return 'Obese';
        }

        function calculateBMR(profile) {
            const { gender, weight, height, age } = profile;
            if (gender === 'male') {
                return (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                return (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }
        }

        function calculateTDEE(profile) {
            const bmr = calculateBMR(profile);
            return Math.round(bmr * activityMultipliers[profile.activity]);
        }

        function getCalorieTarget(profile) {
            const tdee = calculateTDEE(profile);
            switch (profile.goal) {
                case 'weight-loss': return Math.round(tdee - 500);
                case 'muscle-gain': return Math.round(tdee + 300);
                case 'maintenance': return tdee;
                case 'endurance': return Math.round(tdee + 200);
                case 'flexibility': return Math.round(tdee - 200);
                default: return tdee;
            }
        }

        // ============================
        // DASHBOARD RENDERING
        // ============================
        function renderDashboard() {
            if (!currentProfile) return;

            const bmi = calculateBMI(currentProfile.weight, currentProfile.height);
            const bmiCategory = getBMICategory(parseFloat(bmi));
            const calorieTarget = getCalorieTarget(currentProfile);
            const waterTarget = currentProfile.weight > 80 ? '3.0L' : (currentProfile.weight > 60 ? '2.5L' : '2.0L');

            // Update summary
            document.getElementById('bmiValue').textContent = bmi;
            document.getElementById('bmiCategory').textContent = bmiCategory;
            document.getElementById('calorieValue').textContent = calorieTarget;
            document.getElementById('currentWeightDisplay').textContent = currentProfile.weight + ' kg';
            document.getElementById('goalDisplay').textContent = currentProfile.goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            document.getElementById('waterTarget').textContent = waterTarget;

            // Weight progress
            const startWeight = currentProfile.weight;
            const targetWeight = currentProfile.targetWeight;
            const totalDiff = Math.abs(startWeight - targetWeight);
            let progress = 0;
            if (currentLogs.length > 0) {
                const latestWeight = currentLogs[currentLogs.length - 1].weight || startWeight;
                const lostOrGained = Math.abs(startWeight - latestWeight);
                progress = totalDiff > 0 ? Math.min(100, Math.round((lostOrGained / totalDiff) * 100)) : 0;
            }

            const weightDiff = (startWeight - targetWeight).toFixed(1);
            const direction = weightDiff > 0 ? 'lose' : 'gain';
            document.getElementById('weightProgressText').textContent = `Need to ${direction} ${Math.abs(weightDiff)} kg`;
            document.getElementById('progressStartLabel').textContent = `Start: ${startWeight} kg`;
            document.getElementById('progressTargetLabel').textContent = `Target: ${targetWeight} kg`;
            document.getElementById('weightProgressBar').style.width = `${progress}%`;

            // Streak
            const streak = calculateStreak();
            document.getElementById('streakDisplay').textContent = `${streak} day streak`;

            // Motivation
            updateMotivation(streak);

            // Render plans
            renderDayTabs();
            renderMealPlan(1);
            renderWeekSelector();
            renderExercisePlan(1);
            renderLogHistory();
        }

        function calculateStreak() {
            if (currentLogs.length === 0) return 0;
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < currentLogs.length; i++) {
                const logDate = new Date(currentLogs[currentLogs.length - 1 - i].date);
                const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
                if (diffDays === i && currentLogs[currentLogs.length - 1 - i].workout) {
                    streak++;
                } else if (diffDays !== i) {
                    break;
                }
            }
            return streak;
        }

        function updateMotivation(streak) {
            const messages = [
                { title: "Let's crush your goals!", text: "Every step forward is progress. Keep going!" },
                { title: "You're on fire!", text: "One day down, a lifetime of health to go." },
                { title: "Streak mode activated!", text: "Consistency is the key to transformation." },
                { title: "Unstoppable!", text: "Your dedication is inspiring. Keep pushing!" },
                { title: "Legendary status!", text: "You're building habits that last a lifetime." }
            ];
            const msg = messages[Math.min(streak, messages.length - 1)];
            document.getElementById('motivationTitle').textContent = msg.title;
            document.getElementById('motivationText').textContent = msg.text;
        }

        // ============================
        // MEAL PLAN
        // ============================
        const mealDatabase = {
            vegetarian: {
                breakfast: [
                    { name: "Oatmeal with berries and almonds", cal: 350 },
                    { name: "Greek yogurt parfait with granola", cal: 300 },
                    { name: "Avocado toast with poached egg", cal: 400 },
                    { name: "Spinach and feta omelette", cal: 380 },
                    { name: "Smoothie bowl with chia seeds", cal: 320 },
                    { name: "Whole grain toast with peanut butter", cal: 340 },
                    { name: "Paneer bhurji with multigrain toast", cal: 420 }
                ],
                lunch: [
                    { name: "Grilled vegetable quinoa bowl", cal: 450 },
                    { name: "Lentil soup with whole wheat bread", cal: 400 },
                    { name: "Chickpea curry with brown rice", cal: 500 },
                    { name: "Caprese salad with balsamic glaze", cal: 350 },
                    { name: "Vegetable stir-fry with tofu", cal: 420 },
                    { name: "Spinach dal with roti", cal: 480 },
                    { name: "Mushroom risotto", cal: 460 }
                ],
                dinner: [
                    { name: "Baked sweet potato with black beans", cal: 400 },
                    { name: "Vegetable lasagna", cal: 450 },
                    { name: "Palak paneer with jeera rice", cal: 520 },
                    { name: "Zucchini noodles with pesto", cal: 320 },
                    { name: "Stuffed bell peppers with quinoa", cal: 380 },
                    { name: "Miso soup with edamame", cal: 300 },
                    { name: "Eggplant parmesan with salad", cal: 420 }
                ],
                snack: [
                    { name: "Apple slices with almond butter", cal: 200 },
                    { name: "Mixed nuts (30g)", cal: 180 },
                    { name: "Carrot sticks with hummus", cal: 150 },
                    { name: "Roasted chickpeas", cal: 160 },
                    { name: "Fruit salad cup", cal: 120 },
                    { name: "Cottage cheese with cucumber", cal: 140 },
                    { name: "Energy balls (2)", cal: 170 }
                ]
            },
            'non-vegetarian': {
                breakfast: [
                    { name: "Scrambled eggs with spinach", cal: 380 },
                    { name: "Chicken sausage with toast", cal: 420 },
                    { name: "Smoked salmon on whole grain bagel", cal: 450 },
                    { name: "Egg and avocado toast", cal: 400 },
                    { name: "Turkey bacon with omelette", cal: 380 },
                    { name: "Protein pancakes with syrup", cal: 440 },
                    { name: "Boiled eggs with fruit", cal: 320 }
                ],
                lunch: [
                    { name: "Grilled chicken breast with quinoa", cal: 500 },
                    { name: "Salmon fillet with roasted vegetables", cal: 550 },
                    { name: "Turkey wrap with whole wheat tortilla", cal: 480 },
                    { name: "Chicken tikka with mint chutney", cal: 460 },
                    { name: "Tuna salad with olive oil dressing", cal: 420 },
                    { name: "Beef stir-fry with broccoli", cal: 520 },
                    { name: "Chicken biryani (light oil)", cal: 580 }
                ],
                dinner: [
                    { name: "Baked cod with asparagus", cal: 380 },
                    { name: "Chicken fajita bowl", cal: 450 },
                    { name: "Grilled prawns with garlic butter", cal: 400 },
                    { name: "Lamb chops with mint sauce", cal: 520 },
                    { name: "Chicken soup with vegetables", cal: 340 },
                    { name: "Fish curry with brown rice", cal: 480 },
                    { name: "Egg curry with chapati", cal: 440 }
                ],
                snack: [
                    { name: "Boiled eggs (2)", cal: 160 },
                    { name: "Chicken strips with mustard", cal: 200 },
                    { name: "Tuna on whole grain crackers", cal: 180 },
                    { name: "Turkey roll-ups with cheese", cal: 170 },
                    { name: "Salmon sashimi (4 pieces)", cal: 190 },
                    { name: "Protein shake", cal: 160 },
                    { name: "Jerky (beef/turkey)", cal: 150 }
                ]
            },
            vegan: {
                breakfast: [
                    { name: "Chia pudding with coconut milk", cal: 320 },
                    { name: "Tofu scramble with vegetables", cal: 350 },
                    { name: "Overnight oats with flaxseed", cal: 340 },
                    { name: "Banana pancakes (vegan)", cal: 380 },
                    { name: "Fruit smoothie with protein powder", cal: 300 },
                    { name: "Avocado toast with hemp seeds", cal: 360 },
                    { name: "Breakfast burrito with black beans", cal: 400 }
                ],
                lunch: [
                    { name: "Buddha bowl with tahini dressing", cal: 480 },
                    { name: "Lentil Bolognese with pasta", cal: 450 },
                    { name: "Jackfruit curry with rice", cal: 460 },
                    { name: "Falafel wrap with hummus", cal: 520 },
                    { name: "Thai vegetable curry with coconut", cal: 440 },
                    { name: "Quinoa salad with roasted veggies", cal: 400 },
                    { name: "Tofu tikka masala", cal: 480 }
                ],
                dinner: [
                    { name: "Stuffed sweet potatoes with beans", cal: 420 },
                    { name: "Cauliflower steak with chimichurri", cal: 350 },
                    { name: "Veggie burger with side salad", cal: 460 },
                    { name: "Zucchini lasagna with cashew cheese", cal: 380 },
                    { name: "Mushroom stroganoff", cal: 400 },
                    { name: "Tempeh stir-fry with brown rice", cal: 450 },
                    { name: "Vegetable sushi rolls with edamame", cal: 360 }
                ],
                snack: [
                    { name: "Apple with almond butter", cal: 200 },
                    { name: "Roasted chickpeas", cal: 160 },
                    { name: "Vegan protein bar", cal: 180 },
                    { name: "Rice cakes with avocado", cal: 150 },
                    { name: "Trail mix (nuts & dried fruit)", cal: 190 },
                    { name: "Hummus with veggie sticks", cal: 140 },
                    { name: "Frozen banana nice cream", cal: 130 }
                ]
            },
            keto: {
                breakfast: [
                    { name: "Bacon and eggs with avocado", cal: 520 },
                    { name: "Keto smoothie with MCT oil", cal: 480 },
                    { name: "Cheese and spinach frittata", cal: 460 },
                    { name: "Sausage and egg muffins", cal: 440 },
                    { name: "Avocado with smoked salmon", cal: 500 },
                    { name: "Bulletproof coffee with butter", cal: 350 },
                    { name: "Cream cheese pancakes", cal: 420 }
                ],
                lunch: [
                    { name: "Caesar salad with grilled chicken", cal: 520 },
                    { name: "Zucchini noodles with pesto and chicken", cal: 480 },
                    { name: "Beef burger without bun", cal: 550 },
                    { name: "Tuna salad with olive oil mayo", cal: 460 },
                    { name: "Creamy mushroom soup", cal: 400 },
                    { name: "Egg salad with lettuce wraps", cal: 440 },
                    { name: "Steak with garlic butter", cal: 580 }
                ],
                dinner: [
                    { name: "Baked salmon with asparagus", cal: 480 },
                    { name: "Chicken thighs with cauliflower mash", cal: 520 },
                    { name: "Shrimp scampi with zucchini", cal: 460 },
                    { name: "Pork chops with green beans", cal: 500 },
                    { name: "Stuffed mushrooms with cheese", cal: 380 },
                    { name: "Lamb curry with coconut cream", cal: 540 },
                    { name: "Crispy tofu with sesame cabbage", cal: 420 }
                ],
                snack: [
                    { name: "Macadamia nuts (30g)", cal: 220 },
                    { name: "Cheese cubes with olives", cal: 190 },
                    { name: "Boiled eggs (2)", cal: 160 },
                    { name: "Pepperoni slices", cal: 180 },
                    { name: "Celery with almond butter", cal: 170 },
                    { name: "Keto fat bombs (2)", cal: 200 },
                    { name: "Avocado half with salt", cal: 150 }
                ]
            },
            'no-preference': {
                breakfast: [
                    { name: "Scrambled eggs with whole wheat toast", cal: 380 },
                    { name: "Oatmeal with banana and honey", cal: 360 },
                    { name: "Greek yogurt with mixed berries", cal: 320 },
                    { name: "Avocado toast with poached egg", cal: 400 },
                    { name: "Smoothie with protein powder", cal: 340 },
                    { name: "Pancakes with fresh fruit", cal: 420 },
                    { name: "Breakfast burrito with egg and beans", cal: 460 }
                ],
                lunch: [
                    { name: "Grilled chicken salad with vinaigrette", cal: 460 },
                    { name: "Quinoa bowl with roasted vegetables", cal: 440 },
                    { name: "Turkey sandwich on whole grain", cal: 480 },
                    { name: "Salmon poke bowl", cal: 520 },
                    { name: "Vegetable soup with whole grain bread", cal: 380 },
                    { name: "Chicken tikka with brown rice", cal: 500 },
                    { name: "Pasta primavera with parmesan", cal: 450 }
                ],
                dinner: [
                    { name: "Baked chicken with sweet potato", cal: 480 },
                    { name: "Grilled fish with steamed vegetables", cal: 420 },
                    { name: "Stir-fry tofu with brown rice", cal: 440 },
                    { name: "Beef tacos with salsa", cal: 460 },
                    { name: "Lentil curry with chapati", cal: 420 },
                    { name: "Eggplant parmesan with salad", cal: 400 },
                    { name: "Shrimp pasta with garlic oil", cal: 480 }
                ],
                snack: [
                    { name: "Apple with peanut butter", cal: 200 },
                    { name: "Mixed nuts (30g)", cal: 180 },
                    { name: "Hummus with carrot sticks", cal: 150 },
                    { name: "Protein shake", cal: 160 },
                    { name: "Rice cakes with cottage cheese", cal: 140 },
                    { name: "Dark chocolate square", cal: 130 },
                    { name: "Fruit smoothie cup", cal: 170 }
                ]
            }
        };

        function renderDayTabs() {
            const container = document.getElementById('dayTabs');
            container.innerHTML = '';
            for (let i = 1; i <= 30; i++) {
                const tab = document.createElement('button');
                tab.className = `day-tab ${i === 1 ? 'active' : ''}`;
                tab.textContent = `D${i}`;
                tab.onclick = () => {
                    document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    renderMealPlan(i);
                };
                container.appendChild(tab);
            }
        }

        function renderMealPlan(day) {
            const diet = currentProfile.diet;
            const meals = mealDatabase[diet] || mealDatabase['no-preference'];
            const totalDays = 7; // Cycle every 7 days
            const idx = (day - 1) % totalDays;

            const calorieTarget = getCalorieTarget(currentProfile);
            const goal = currentProfile.goal;

            let portions = '';
            if (goal === 'weight-loss') portions = 'Standard portions, prioritize vegetables';
            else if (goal === 'muscle-gain') portions = 'Large portions, extra protein';
            else if (goal === 'endurance') portions = 'Moderate-large portions, extra carbs';
            else if (goal === 'flexibility') portions = 'Standard portions, anti-inflammatory foods';
            else portions = 'Balanced portions';

            const html = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="meal-card">
                            <div class="meal-type">Breakfast</div>
                            <div class="meal-title">${meals.breakfast[idx].name}</div>
                            <div class="meal-cal"><i class="bi bi-fire"></i>${meals.breakfast[idx].cal} kcal</div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="meal-card">
                            <div class="meal-type">Lunch</div>
                            <div class="meal-title">${meals.lunch[idx].name}</div>
                            <div class="meal-cal"><i class="bi bi-fire"></i>${meals.lunch[idx].cal} kcal</div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="meal-card">
                            <div class="meal-type">Dinner</div>
                            <div class="meal-title">${meals.dinner[idx].name}</div>
                            <div class="meal-cal"><i class="bi bi-fire"></i>${meals.dinner[idx].cal} kcal</div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="meal-card">
                            <div class="meal-type">Snack</div>
                            <div class="meal-title">${meals.snack[idx].name}</div>
                            <div class="meal-cal"><i class="bi bi-fire"></i>${meals.snack[idx].cal} kcal</div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 p-3" style="background: #f8faf9; border-radius: 12px;">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <strong style="color: var(--primary-green);">Daily Target: ${calorieTarget} kcal</strong>
                            <div class="small" style="color: var(--text-muted);">${portions}</div>
                        </div>
                        <div class="streak-badge">
                            <i class="bi bi-calendar-check"></i>
                            Day ${day} of 30
                        </div>
                    </div>
                    ${currentProfile.allergies ? `<div class="mt-2 small" style="color: #dc3545;"><i class="bi bi-exclamation-triangle me-1"></i> Avoid: ${currentProfile.allergies}</div>` : ''}
                </div>
            `;
            document.getElementById('mealPlanContent').innerHTML = html;
        }

        // ============================
        // EXERCISE PLAN
        // ============================
        const exercisePlans = {
            home: {
                'weight-loss': [
                    { day: 'Monday', focus: 'Full Body HIIT', exercises: 'Jumping jacks, burpees, mountain climbers, high knees | 3 rounds x 45 sec each' },
                    { day: 'Tuesday', focus: 'Active Recovery', exercises: 'Brisk walking or light jog | 30-45 minutes' },
                    { day: 'Wednesday', focus: 'Strength Circuit', exercises: 'Push-ups, squats, lunges, planks | 3 rounds x 15 reps' },
                    { day: 'Thursday', focus: 'Cardio Blast', exercises: 'Jump rope, stair climbing, shadow boxing | 30 minutes' },
                    { day: 'Friday', focus: 'Core & Abs', exercises: 'Crunches, leg raises, Russian twists, plank holds | 3 rounds' },
                    { day: 'Saturday', focus: 'Full Body HIIT', exercises: 'Burpees, squat jumps, plank jacks, skaters | 3 rounds x 40 sec' },
                    { day: 'Sunday', focus: 'Rest / Yoga', exercises: 'Stretching, yoga flow, meditation | 20-30 minutes' }
                ],
                'muscle-gain': [
                    { day: 'Monday', focus: 'Upper Body Push', exercises: 'Push-ups, pike push-ups, tricep dips, wall handstand | 4 rounds x 12 reps' },
                    { day: 'Tuesday', focus: 'Lower Body', exercises: 'Squats, Bulgarian splits, glute bridges, calf raises | 4 rounds x 15 reps' },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: 'Light cardio, stretching | 20-30 minutes' },
                    { day: 'Thursday', focus: 'Upper Body Pull', exercises: 'Door rows, Superman holds, reverse snow angels, bicep curls (water bottles) | 4 rounds' },
                    { day: 'Friday', focus: 'Legs & Core', exercises: 'Lunges, side lunges, pistol squats (assisted), hanging leg raises | 4 rounds' },
                    { day: 'Saturday', focus: 'Full Body Strength', exercises: 'Burpees, bear crawls, inchworms, pull-ups (if bar available) | 3 rounds' },
                    { day: 'Sunday', focus: 'Rest / Mobility', exercises: 'Foam rolling, stretching, yoga | 30 minutes' }
                ],
                'maintenance': [
                    { day: 'Monday', focus: 'Full Body Circuit', exercises: 'Squats, push-ups, planks, lunges | 3 rounds x 12 reps' },
                    { day: 'Tuesday', focus: 'Cardio', exercises: 'Jogging, cycling, or brisk walking | 30 minutes' },
                    { day: 'Wednesday', focus: 'Core Strength', exercises: 'Planks, Russian twists, bicycle crunches | 3 rounds' },
                    { day: 'Thursday', focus: 'Upper Body', exercises: 'Push-ups, tricep dips, pike push-ups | 3 rounds x 12 reps' },
                    { day: 'Friday', focus: 'Lower Body', exercises: 'Squats, lunges, glute bridges, calf raises | 3 rounds x 15 reps' },
                    { day: 'Saturday', focus: 'Active Fun', exercises: 'Sports, hiking, swimming, or dancing | 45-60 minutes' },
                    { day: 'Sunday', focus: 'Rest / Stretch', exercises: 'Yoga, stretching, meditation | 20-30 minutes' }
                ],
                'endurance': [
                    { day: 'Monday', focus: 'Long Cardio', exercises: 'Brisk walking or jogging | 45-60 minutes' },
                    { day: 'Tuesday', focus: 'Tempo Training', exercises: 'Interval running: 3 min fast, 2 min slow x 5 | 25 minutes' },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: 'Light walk or gentle yoga | 30 minutes' },
                    { day: 'Thursday', focus: 'HIIT Endurance', exercises: 'Burpees, squat jumps, mountain climbers, high knees | 4 rounds x 60 sec' },
                    { day: 'Friday', focus: 'Steady State', exercises: 'Continuous moderate cardio | 40 minutes' },
                    { day: 'Saturday', focus: 'Long Session', exercises: 'Extended jog, hike, or bike ride | 60-90 minutes' },
                    { day: 'Sunday', focus: 'Rest / Stretch', exercises: 'Foam rolling, stretching | 20-30 minutes' }
                ],
                'flexibility': [
                    { day: 'Monday', focus: 'Yoga Flow', exercises: 'Sun salutations, warrior poses, downward dog | 45 minutes' },
                    { day: 'Tuesday', focus: 'Dynamic Stretching', exercises: 'Arm circles, leg swings, hip circles, torso twists | 20 minutes' },
                    { day: 'Wednesday', focus: 'Pilates', exercises: 'Hundred, roll-ups, leg circles, spine stretch | 30 minutes' },
                    { day: 'Thursday', focus: 'Static Stretching', exercises: 'Hamstring, hip flexor, shoulder, chest stretches | 30 minutes' },
                    { day: 'Friday', focus: 'Yoga Flow', exercises: 'Balance poses, seated forward folds, twists | 45 minutes' },
                    { day: 'Saturday', focus: 'Mobility Work', exercises: 'Joint circles, cat-cow, thoracic rotations, ankle mobility | 25 minutes' },
                    { day: 'Sunday', focus: 'Rest / Meditation', exercises: 'Gentle stretching, breathing exercises | 20 minutes' }
                ]
            },
            gym: {
                'weight-loss': [
                    { day: 'Monday', focus: 'Full Body Circuit', exercises: 'Treadmill intervals, lat pulldown, leg press, dumbbell press | 3 rounds' },
                    { day: 'Tuesday', focus: 'Cardio', exercises: 'Stairmaster or elliptical | 35 minutes' },
                    { day: 'Wednesday', focus: 'Strength Supersets', exercises: 'Bench press & rows, squats & lunges, planks | 3 rounds x 12 reps' },
                    { day: 'Thursday', focus: 'HIIT', exercises: 'Battle ropes, box jumps, kettlebell swings, sled push | 4 rounds' },
                    { day: 'Friday', focus: 'Core & Conditioning', exercises: 'Cable crunches, Russian twists, farmer carries, plank | 3 rounds' },
                    { day: 'Saturday', focus: 'Cardio + Weights', exercises: '20 min run, then full body dumbbell circuit | 45 minutes total' },
                    { day: 'Sunday', focus: 'Rest / Stretch', exercises: 'Foam rolling, stretching, sauna | 20-30 minutes' }
                ],
                'muscle-gain': [
                    { day: 'Monday', focus: 'Chest & Triceps', exercises: 'Bench press, incline dumbbell press, cable flys, tricep pushdowns | 4 x 8-12' },
                    { day: 'Tuesday', focus: 'Back & Biceps', exercises: 'Deadlifts, lat pulldowns, barbell rows, hammer curls | 4 x 8-12' },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: 'Light cardio, stretching, abs | 30 minutes' },
                    { day: 'Thursday', focus: 'Legs', exercises: 'Squats, leg press, Romanian deadlifts, leg extensions, calf raises | 4 x 10-15' },
                    { day: 'Friday', focus: 'Shoulders & Arms', exercises: 'Overhead press, lateral raises, front raises, bicep curls, dips | 4 x 10-12' },
                    { day: 'Saturday', focus: 'Weak Point Training', exercises: 'Target lagging muscle group with volume | 45 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Complete rest or light stretching' }
                ],
                'maintenance': [
                    { day: 'Monday', focus: 'Upper Body', exercises: 'Bench press, rows, shoulder press, lat pulldown | 3 x 10-12' },
                    { day: 'Tuesday', focus: 'Lower Body', exercises: 'Squats, leg press, lunges, calf raises | 3 x 12-15' },
                    { day: 'Wednesday', focus: 'Cardio', exercises: 'Treadmill, bike, or elliptical | 30 minutes' },
                    { day: 'Thursday', focus: 'Push', exercises: 'Chest, shoulders, triceps | 3 x 10-12' },
                    { day: 'Friday', focus: 'Pull', exercises: 'Back, biceps, rear delts | 3 x 10-12' },
                    { day: 'Saturday', focus: 'Full Body', exercises: 'Compound movements, circuits | 40 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Light activity or rest' }
                ],
                'endurance': [
                    { day: 'Monday', focus: 'Long Run', exercises: 'Treadmill or track running | 45-60 minutes' },
                    { day: 'Tuesday', focus: 'Cross Training', exercises: 'Rowing machine or swimming | 30 minutes' },
                    { day: 'Wednesday', focus: 'Interval Training', exercises: 'Treadmill sprints: 1 min fast, 1 min slow x 10 | 20 minutes' },
                    { day: 'Thursday', focus: 'Tempo Run', exercises: 'Steady pace run | 30-40 minutes' },
                    { day: 'Friday', focus: 'Strength Endurance', exercises: 'High rep squats, lunges, step-ups, planks | 3 x 20' },
                    { day: 'Saturday', focus: 'Long Session', exercises: 'Extended cardio session | 60-90 minutes' },
                    { day: 'Sunday', focus: 'Recovery', exercises: 'Stretching, foam rolling, light walk | 30 minutes' }
                ],
                'flexibility': [
                    { day: 'Monday', focus: 'Yoga Class', exercises: 'Gym yoga or guided stretching | 45-60 minutes' },
                    { day: 'Tuesday', focus: 'Light Cardio + Stretch', exercises: '10 min bike, then full body stretch | 30 minutes' },
                    { day: 'Wednesday', focus: 'Pilates', exercises: 'Reformer or mat Pilates | 45 minutes' },
                    { day: 'Thursday', focus: 'Mobility', exercises: 'Dynamic stretches, foam rolling, band stretches | 30 minutes' },
                    { day: 'Friday', focus: 'Yoga Flow', exercises: 'Vinyasa or hatha yoga | 45 minutes' },
                    { day: 'Saturday', focus: 'Stretch Class', exercises: 'Guided stretching or PNF stretching | 30 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Complete rest or gentle stretching' }
                ]
            },
            none: {
                'weight-loss': [
                    { day: 'Monday', focus: 'Outdoor Cardio', exercises: 'Brisk walking, jogging, or cycling | 45 minutes' },
                    { day: 'Tuesday', focus: 'Bodyweight HIIT', exercises: 'Burpees, jumping jacks, squats, push-ups | 3 rounds x 45 sec' },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: 'Leisurely walk or light swim | 30 minutes' },
                    { day: 'Thursday', focus: 'Hill/Reps', exercises: 'Stair climbing, hill walking, sprint intervals | 30 minutes' },
                    { day: 'Friday', focus: 'Core Circuit', exercises: 'Planks, mountain climbers, leg raises, crunches | 3 rounds' },
                    { day: 'Saturday', focus: 'Long Activity', exercises: 'Hiking, biking, or sports | 60+ minutes' },
                    { day: 'Sunday', focus: 'Rest / Stretch', exercises: 'Stretching, yoga, meditation | 20-30 minutes' }
                ],
                'muscle-gain': [
                    { day: 'Monday', focus: 'Upper Body', exercises: 'Push-ups, pull-ups (park), dips, handstand practice | 4 rounds' },
                    { day: 'Tuesday', focus: 'Lower Body', exercises: 'Sprints, hill runs, pistol squat progressions, jumps | 4 rounds' },
                    { day: 'Wednesday', focus: 'Active Recovery', exercises: 'Swimming or light jogging | 30 minutes' },
                    { day: 'Thursday', focus: 'Full Body', exercises: 'Bear crawls, crab walks, pull-ups, push-up variations | 4 rounds' },
                    { day: 'Friday', focus: 'Explosive Power', exercises: 'Box jumps (bench/park), broad jumps, clap push-ups | 4 rounds' },
                    { day: 'Saturday', focus: 'Outdoor Strength', exercises: 'Park workout: pull-ups, dips, rows, hanging leg raises | 45 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Complete rest or stretching' }
                ],
                'maintenance': [
                    { day: 'Monday', focus: 'Jog/Walk', exercises: 'Outdoor jogging or brisk walking | 30 minutes' },
                    { day: 'Tuesday', focus: 'Calisthenics', exercises: 'Push-ups, squats, lunges, planks at a park | 3 rounds' },
                    { day: 'Wednesday', focus: 'Swimming / Cycling', exercises: 'Swim or bike ride | 30-45 minutes' },
                    { day: 'Thursday', focus: 'Bodyweight Circuit', exercises: 'Burpees, jumping jacks, high knees, mountain climbers | 3 rounds' },
                    { day: 'Friday', focus: 'Sports / Activity', exercises: 'Play a sport, hike, or long walk | 45 minutes' },
                    { day: 'Saturday', focus: 'Active Outing', exercises: 'Hiking, beach walk, or outdoor yoga | 60 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Light stretching or rest' }
                ],
                'endurance': [
                    { day: 'Monday', focus: 'Long Run', exercises: 'Steady pace running | 45-60 minutes' },
                    { day: 'Tuesday', focus: 'Intervals', exercises: 'Sprint 200m, jog 200m x 8-10 | 30 minutes' },
                    { day: 'Wednesday', focus: 'Recovery', exercises: 'Easy jog or walk | 20-30 minutes' },
                    { day: 'Thursday', focus: 'Tempo', exercises: 'Comfortably hard pace | 30-40 minutes' },
                    { day: 'Friday', focus: 'Cross Training', exercises: 'Swimming or cycling | 30 minutes' },
                    { day: 'Saturday', focus: 'Long Run', exercises: 'Extended run | 60-90 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Stretching, massage, rest' }
                ],
                'flexibility': [
                    { day: 'Monday', focus: 'Park Yoga', exercises: 'Outdoor yoga session | 45 minutes' },
                    { day: 'Tuesday', focus: 'Dynamic Stretch', exercises: 'Full body dynamic stretches | 20 minutes' },
                    { day: 'Wednesday', focus: 'Swim + Stretch', exercises: 'Easy swim, then stretch in water or after | 30 minutes' },
                    { day: 'Thursday', focus: 'Static Stretching', exercises: 'Hold stretches 30-60 seconds each | 30 minutes' },
                    { day: 'Friday', focus: 'Beach/Grass Yoga', exercises: 'Balance and flexibility poses | 45 minutes' },
                    { day: 'Saturday', focus: 'Mobility Walk', exercises: 'Walk with frequent stretch breaks | 40 minutes' },
                    { day: 'Sunday', focus: 'Rest', exercises: 'Gentle stretching or meditation | 20 minutes' }
                ]
            }
        };

        function renderWeekSelector() {
            const container = document.getElementById('weekSelector');
            container.innerHTML = '';
            for (let i = 1; i <= 4; i++) {
                const btn = document.createElement('button');
                btn.className = `week-btn ${i === 1 ? 'active' : ''}`;
                btn.textContent = `Week ${i}`;
                btn.onclick = () => {
                    document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderExercisePlan(i);
                };
                container.appendChild(btn);
            }
        }

        function renderExercisePlan(week) {
            const env = currentProfile.environment;
            const goal = currentProfile.goal;
            const plan = exercisePlans[env]?.[goal] || exercisePlans.home['weight-loss'];

            // Adjust intensity based on week
            const intensityMod = week === 1 ? ' (Foundation)' : week === 2 ? ' (Building)' : week === 3 ? ' (Progression)' : ' (Peak)';

            let html = '<div class="table-responsive exercise-table"><table class="table mb-0"><thead><tr><th>Day</th><th>Focus</th><th>Exercises / Duration</th><th>Status</th></tr></thead><tbody>';
            plan.forEach((dayPlan, idx) => {
                const dayId = `w${week}d${idx}`;
                const isDone = currentLogs.some(l => l.workoutDays && l.workoutDays.includes(dayId));
                html += `
                    <tr>
                        <td><strong>${dayPlan.day}</strong></td>
                        <td><span class="badge-exercise">${dayPlan.focus}${intensityMod}</span></td>
                        <td>${dayPlan.exercises}</td>
                        <td>
                            <div class="workout-check ${isDone ? 'completed' : ''}" onclick="toggleWorkoutDay('${dayId}', this)">
                                ${isDone ? '<i class="bi bi-check"></i>' : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
            document.getElementById('exercisePlanContent').innerHTML = html;
        }

        function toggleWorkoutDay(dayId, el) {
            const today = new Date().toISOString().split('T')[0];
            let todayLog = currentLogs.find(l => l.date === today);
            if (!todayLog) {
                todayLog = { date: today, weight: '', calories: '', minutes: '', workout: false, diet: false, workoutDays: [] };
                currentLogs.push(todayLog);
            }
            if (!todayLog.workoutDays) todayLog.workoutDays = [];

            if (todayLog.workoutDays.includes(dayId)) {
                todayLog.workoutDays = todayLog.workoutDays.filter(d => d !== dayId);
                el.classList.remove('completed');
                el.innerHTML = '';
            } else {
                todayLog.workoutDays.push(dayId);
                el.classList.add('completed');
                el.innerHTML = '<i class="bi bi-check"></i>';
            }
            saveLogs();
            renderDashboard();
        }

        // ============================
        // GOAL TRACKER
        // ============================
        function addLogEntry() {
            const weight = parseFloat(document.getElementById('logWeight').value);
            const calories = parseInt(document.getElementById('logCalories').value);
            const minutes = parseInt(document.getElementById('logMinutes').value);
            const workout = document.getElementById('workoutCompleted').checked;
            const diet = document.getElementById('dietFollowed').checked;

            if (!weight && !calories && !minutes) {
                showTrackerMessage('Please enter at least one value.', 'warning');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const existingIdx = currentLogs.findIndex(l => l.date === today);

            const entry = {
                date: today,
                weight: weight || (existingIdx >= 0 ? currentLogs[existingIdx].weight : ''),
                calories: calories || '',
                minutes: minutes || '',
                workout: workout,
                diet: diet,
                workoutDays: existingIdx >= 0 ? (currentLogs[existingIdx].workoutDays || []) : []
            };

            if (existingIdx >= 0) {
                currentLogs[existingIdx] = entry;
            } else {
                currentLogs.push(entry);
            }

            saveLogs();

            // Clear inputs
            document.getElementById('logWeight').value = '';
            document.getElementById('logCalories').value = '';
            document.getElementById('logMinutes').value = '';
            document.getElementById('workoutCompleted').checked = false;
            document.getElementById('dietFollowed').checked = false;

            showTrackerMessage('Progress logged successfully! Keep it up!', 'success');
            renderDashboard();
        }

        function showTrackerMessage(msg, type) {
            const div = document.getElementById('trackerMessage');
            div.className = `alert alert-${type} alert-custom mt-3`;
            div.textContent = msg;
            div.style.display = 'block';
            setTimeout(() => { div.style.display = 'none'; }, 3000);
        }

        function renderLogHistory() {
            const container = document.getElementById('logHistory');
            if (currentLogs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="bi bi-journal"></i>
                        <p>No entries yet. Start logging your progress today!</p>
                    </div>
                `;
                return;
            }

            const sorted = [...currentLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
            let html = '';
            sorted.forEach(log => {
                const details = [];
                if (log.weight) details.push(`${log.weight} kg`);
                if (log.calories) details.push(`${log.calories} kcal`);
                if (log.minutes) details.push(`${log.minutes} min`);
                if (log.workout) details.push('<i class="bi bi-check-circle-fill text-success"></i> Workout');
                if (log.diet) details.push('<i class="bi bi-check-circle-fill text-success"></i> Diet');

                html += `
                    <div class="log-entry">
                        <div>
                            <div class="log-entry-date">${formatDate(log.date)}</div>
                            <div class="log-entry-details">${details.length > 0 ? details.join(' &bull; ') : 'No details logged'}</div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLog('${log.date}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function formatDate(dateStr) {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        function deleteLog(date) {
            if (confirm('Delete this log entry?')) {
                currentLogs = currentLogs.filter(l => l.date !== date);
                saveLogs();
                renderDashboard();
            }
        }

        // ============================
        // INIT
        // ============================
        document.addEventListener('DOMContentLoaded', () => {
            checkAuth();
        });