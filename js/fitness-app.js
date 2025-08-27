/**
 * Fitness App Main Manager
 * Ana uygulama işlevsellik yöneticisi
 */

class FitnessApp {
    constructor() {
        this.currentView = 'dashboard';
        this.workoutDaysCompleted = new Set();
        this.nutritionProgress = {};
        this.goals = [];
        this.measurements = [];
        this.currentDate = new Date();
        
        this.init();
    }

    async init() {
        // Data Manager'ın hazır olmasını bekle
        if (window.dataManager) {
            await window.dataManager.initDB();
        }
        
        this.setupEventListeners();
        this.loadUserData();
        await this.loadWorkoutStatus();
        await this.loadGoals();
        await this.loadMeasurements();
        this.setupCalendar();
        this.updateUI();
        
        console.log('Fitness App başlatıldı');
    }

    setupEventListeners() {
        // Tab değiştirme
        document.querySelectorAll('nav a').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.getAttribute('data-target'));
            });
        });

        // Kullanıcı profil kaydetme
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', () => this.saveUserProfile());
        }

        // Antrenman günü tamamlama butonları
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workoutDay = e.target.closest('.workout-day');
                if (workoutDay) {
                    this.toggleWorkoutDay(workoutDay.id);
                }
            });
        });

        // Egzersiz log kaydetme
        const saveLogBtn = document.getElementById('saveLogBtn');
        if (saveLogBtn) {
            saveLogBtn.addEventListener('click', () => this.saveWorkoutLog());
        }

        // Vücut ölçüleri kaydetme
        const saveMeasurementsBtn = document.getElementById('saveMeasurementsBtn');
        if (saveMeasurementsBtn) {
            saveMeasurementsBtn.addEventListener('click', () => this.saveMeasurements());
        }

        // Hedef ekleme
        const addGoalBtnMain = document.getElementById('addGoalBtnMain');
        if (addGoalBtnMain) {
            addGoalBtnMain.addEventListener('click', () => this.showGoalForm());
        }

        const saveGoalBtn = document.getElementById('saveGoalBtn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', () => this.saveGoal());
        }

        // Beslenme takibi
        document.querySelectorAll('.complete-food').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleFoodCompletion(e.target);
            });
        });

        // Kalori takibi (günlük görünüm)
        document.querySelectorAll('#dailyView input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateDailyCalories();
            });
        });

        // Günü tamamla butonu
        const completeDayBtn = document.getElementById('completeDayBtn');
        if (completeDayBtn) {
            completeDayBtn.addEventListener('click', () => this.completeDay());
        }

        // Takvim görünüm değiştirme
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCalendarView(e.target.getAttribute('data-view'));
            });
        });

        // Notları kaydetme
        const saveNotesBtn = document.getElementById('saveNotesBtn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => this.saveDailyNotes());
        }

        // Dışa aktarma butonları (eklenecek)
        this.setupExportButtons();
    }

    switchTab(targetTab) {
        // Tüm tabları gizle
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });

        // Hedef tabı göster
        const targetElement = document.getElementById(targetTab);
        if (targetElement) {
            targetElement.classList.add('active');
        }

        // Aktif linki işaretle
        document.querySelector(`nav a[data-target="${targetTab}"]`).classList.add('active');
        
        this.currentView = targetTab;

        // Tab'a özel güncelleme işlemleri
        if (targetTab === 'training-calendar') {
            this.updateCalendarView();
        } else if (targetTab === 'goals') {
            this.updateGoalsView();
        } else if (targetTab === 'body-measurements') {
            this.updateMeasurementsView();
        }
    }

    loadUserData() {
        if (!window.dataManager) return;

        const userData = window.dataManager.getUserData();
        
        // UI'yi güncelle
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userLevel').textContent = `Seviye: ${userData.level}`;
        document.getElementById('userWeightStat').textContent = `${userData.weight} kg`;
        document.getElementById('completedWorkoutStat').textContent = userData.completedWorkouts;
        document.getElementById('streakStat').textContent = userData.streak;
        
        // Modal form alanlarını doldur
        document.getElementById('userNameInput').value = userData.name;
        document.getElementById('userWeight').value = userData.weight;
        document.getElementById('initialWeight').value = userData.initialWeight;
        document.getElementById('userBench').value = userData.benchPress;
        document.getElementById('userSquat').value = userData.squat;
        document.getElementById('userLevelSelect').value = userData.level;

        // Avatar güncelle
        const avatar = document.querySelector('.user-avatar');
        if (avatar && userData.name) {
            avatar.textContent = userData.name.charAt(0).toUpperCase();
        }
    }

    saveUserProfile() {
        if (!window.dataManager) return;

        const userData = {
            name: document.getElementById('userNameInput').value,
            weight: parseFloat(document.getElementById('userWeight').value) || 0,
            initialWeight: parseFloat(document.getElementById('initialWeight').value) || 0,
            benchPress: parseFloat(document.getElementById('userBench').value) || 0,
            squat: parseFloat(document.getElementById('userSquat').value) || 0,
            level: document.getElementById('userLevelSelect').value,
            completedWorkouts: window.dataManager.getUserData().completedWorkouts || 0,
            streak: window.dataManager.getUserData().streak || 0
        };

        window.dataManager.saveUserData(userData);
        this.loadUserData();
        
        // Modal'ı kapat
        document.getElementById('userModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        showNotification('Profil bilgileri güncellendi!', 'success');
    }

    async toggleWorkoutDay(dayId) {
        const dayElement = document.getElementById(dayId);
        if (!dayElement) return;

        const isCompleted = dayElement.classList.contains('completed');
        
        if (isCompleted) {
            dayElement.classList.remove('completed');
            this.workoutDaysCompleted.delete(dayId);
        } else {
            dayElement.classList.add('completed');
            this.workoutDaysCompleted.add(dayId);
        }

        // Veri tabanına kaydet
        if (window.dataManager) {
            await window.dataManager.saveWorkoutDayStatus(dayId, !isCompleted);
        }

        // Kullanıcı verilerini güncelle
        const userData = window.dataManager.getUserData();
        userData.completedWorkouts = this.workoutDaysCompleted.size;
        
        // Devamlılık hesapla (basit)
        userData.streak = this.calculateStreak();
        
        window.dataManager.saveUserData(userData);
        this.loadUserData();
        this.updateProgressBar();

        const message = isCompleted ? 'Antrenman günü iptal edildi' : 'Antrenman günü tamamlandı!';
        showNotification(message, isCompleted ? 'warning' : 'success');
    }

    calculateStreak() {
        // Basit devamlılık hesaplama - gerçek projede daha karmaşık olabilir
        return this.workoutDaysCompleted.size;
    }

    async loadWorkoutStatus() {
        if (!window.dataManager) return;

        try {
            const workoutDays = await window.dataManager.getWorkoutDayStatus();
            
            workoutDays.forEach(dayStatus => {
                if (dayStatus.completed) {
                    this.workoutDaysCompleted.add(dayStatus.dayId);
                    const dayElement = document.getElementById(dayStatus.dayId);
                    if (dayElement) {
                        dayElement.classList.add('completed');
                    }
                }
            });

            this.updateProgressBar();
        } catch (error) {
            console.error('Antrenman durumu yüklenirken hata:', error);
        }
    }

    updateProgressBar() {
        const completedCount = this.workoutDaysCompleted.size;
        const totalWorkouts = 5; // 5 günlük program
        
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('weekProgress').textContent = `${completedCount}/${totalWorkouts}`;
        
        const progressFill = document.getElementById('weekProgressFill');
        const progressPercentage = (completedCount / totalWorkouts) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }

    async saveWorkoutLog() {
        if (!window.dataManager) return;

        const exerciseName = document.getElementById('exerciseName').value;
        const workoutDate = document.getElementById('workoutDate').value;
        const notes = document.getElementById('notes').value;
        
        // Set bilgilerini topla
        const sets = [];
        document.querySelectorAll('.set-row').forEach(row => {
            const weight = row.querySelector('.set-weight').value;
            const reps = row.querySelector('.set-reps').value;
            
            if (weight && reps) {
                sets.push({
                    weight: parseFloat(weight),
                    reps: parseInt(reps)
                });
            }
        });

        if (sets.length === 0) {
            showNotification('En az bir set bilgisi girmelisiniz!', 'warning');
            return;
        }

        const workoutData = {
            exercise: exerciseName,
            date: workoutDate,
            sets: sets,
            notes: notes
        };

        try {
            await window.dataManager.addWorkoutLog(workoutData);
            
            // Modal'ı kapat
            document.getElementById('logModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Formu temizle
            this.clearWorkoutForm();
            
            // Geçmiş kayıtları güncelle
            await this.loadWorkoutHistory(exerciseName);
            
            showNotification('Antrenman kaydı başarıyla kaydedildi!', 'success');
        } catch (error) {
            console.error('Antrenman kaydı kaydedilirken hata:', error);
            showNotification('Kayıt sırasında hata oluştu!', 'error');
        }
    }

    clearWorkoutForm() {
        document.getElementById('notes').value = '';
        const setsContainer = document.getElementById('setsContainer');
        setsContainer.innerHTML = '';
        addSetRow(); // Tek boş set ekle
    }

    async loadWorkoutHistory(exerciseName) {
        if (!window.dataManager) return;

        try {
            const workouts = await window.dataManager.getWorkoutLogs(exerciseName);
            const historyContainer = document.getElementById('historyContainer');
            
            if (workouts.length === 0) {
                historyContainer.innerHTML = '<h3>Geçmiş Kayıtlar</h3><p>Henüz kayıt bulunmuyor.</p>';
                return;
            }

            let historyHTML = '<h3>Geçmiş Kayıtlar</h3>';
            workouts.slice(0, 5).forEach(workout => { // Son 5 kaydı göster
                historyHTML += `
                    <div class="history-item" onclick="loadWorkoutToForm(${JSON.stringify(workout).replace(/"/g, '&quot;')})">
                        <div><strong>${new Date(workout.date).toLocaleDateString('tr-TR')}</strong></div>
                        <div>${workout.sets.map(set => `${set.weight}kg x ${set.reps}`).join(', ')}</div>
                        ${workout.notes ? `<div><em>${workout.notes}</em></div>` : ''}
                    </div>
                `;
            });
            
            historyContainer.innerHTML = historyHTML;
        } catch (error) {
            console.error('Geçmiş kayıtlar yüklenirken hata:', error);
        }
    }

    async saveMeasurements() {
        if (!window.dataManager) return;

        const measurements = {
            chest: parseFloat(document.getElementById('chestMeasurement').value) || null,
            arm: parseFloat(document.getElementById('armMeasurement').value) || null,
            waist: parseFloat(document.getElementById('waistMeasurement').value) || null,
            hip: parseFloat(document.getElementById('hipMeasurement').value) || null,
            leg: parseFloat(document.getElementById('legMeasurement').value) || null,
            calf: parseFloat(document.getElementById('calfMeasurement').value) || null
        };

        // En az bir ölçüm girilmiş mi kontrol et
        const hasValidMeasurement = Object.values(measurements).some(value => value !== null);
        
        if (!hasValidMeasurement) {
            showNotification('En az bir ölçüm değeri girmelisiniz!', 'warning');
            return;
        }

        try {
            await window.dataManager.addMeasurement(measurements);
            
            // Formu temizle
            Object.keys(measurements).forEach(key => {
                document.getElementById(`${key}Measurement`).value = '';
            });
            
            await this.loadMeasurements();
            this.updateMeasurementsChart();
            
            showNotification('Vücut ölçüleri başarıyla kaydedildi!', 'success');
        } catch (error) {
            console.error('Ölçüm kaydedilirken hata:', error);
            showNotification('Kayıt sırasında hata oluştu!', 'error');
        }
    }

    async loadMeasurements() {
        if (!window.dataManager) return;

        try {
            this.measurements = await window.dataManager.getMeasurements();
        } catch (error) {
            console.error('Ölçümler yüklenirken hata:', error);
        }
    }

    updateMeasurementsChart() {
        if (this.measurements.length === 0) return;

        const ctx = document.getElementById('measurementsChart');
        if (!ctx) return;

        // Chart.js ile ölçüm grafiği oluştur
        const chartData = {
            labels: this.measurements.slice(-10).map(m => new Date(m.date).toLocaleDateString('tr-TR')),
            datasets: [
                {
                    label: 'Göğüs (cm)',
                    data: this.measurements.slice(-10).map(m => m.chest),
                    borderColor: '#4e73ff',
                    backgroundColor: 'rgba(78, 115, 255, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Kol (cm)',
                    data: this.measurements.slice(-10).map(m => m.arm),
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    tension: 0.3
                }
            ]
        };

        if (this.measurementsChart) {
            this.measurementsChart.destroy();
        }

        this.measurementsChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e9ecef'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#e9ecef' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#e9ecef' }
                    }
                }
            }
        });
    }

    showGoalForm() {
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
        }
    }

    async saveGoal() {
        if (!window.dataManager) return;

        const goalName = document.getElementById('goalName').value;
        const currentValue = parseFloat(document.getElementById('currentValue').value) || 0;
        const targetValue = parseFloat(document.getElementById('targetValue').value) || 0;

        if (!goalName || targetValue <= 0) {
            showNotification('Hedef adı ve hedef değer zorunludur!', 'warning');
            return;
        }

        const goalData = {
            name: goalName,
            currentValue: currentValue,
            targetValue: targetValue,
            progress: currentValue / targetValue * 100
        };

        try {
            await window.dataManager.addGoal(goalData);
            
            // Formu temizle
            document.getElementById('goalName').value = '';
            document.getElementById('currentValue').value = '';
            document.getElementById('targetValue').value = '';
            
            // Form'u gizle
            document.getElementById('goalForm').style.display = 'none';
            
            await this.loadGoals();
            this.updateGoalsView();
            
            showNotification('Hedef başarıyla eklendi!', 'success');
        } catch (error) {
            console.error('Hedef kaydedilirken hata:', error);
            showNotification('Kayıt sırasında hata oluştu!', 'error');
        }
    }

    async loadGoals() {
        if (!window.dataManager) return;

        try {
            this.goals = await window.dataManager.getGoals();
        } catch (error) {
            console.error('Hedefler yüklenirken hata:', error);
        }
    }

    updateGoalsView() {
        const goalsContainer = document.getElementById('goalsContainer');
        if (!goalsContainer) return;

        if (this.goals.length === 0) {
            goalsContainer.innerHTML = `
                <div class="goal-card">
                    <h3>Henüz hedef eklenmemiş</h3>
                    <p>İlk hedefinizi eklemek için "Yeni Hedef Ekle" butonuna tıklayın.</p>
                </div>
            `;
            return;
        }

        let goalsHTML = '';
        this.goals.forEach(goal => {
            const progress = goal.targetValue ? (goal.currentValue / goal.targetValue * 100) : 0;
            const progressClamped = Math.min(progress, 100);
            
            goalsHTML += `
                <div class="goal-card">
                    <h3><i class="fas fa-bullseye"></i> ${goal.name}</h3>
                    <div class="goal-actions">
                        <button onclick="editGoal(${goal.id})" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteGoal(${goal.id})" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-fill" style="width: ${progressClamped}%"></div>
                    </div>
                    <div class="goal-stats">
                        <span>Şu anki: ${goal.currentValue}</span>
                        <span>Hedef: ${goal.targetValue}</span>
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <span style="color: var(--primary); font-weight: bold;">${progress.toFixed(1)}% Tamamlandı</span>
                    </div>
                </div>
            `;
        });

        goalsContainer.innerHTML = goalsHTML;
    }

    async deleteGoal(goalId) {
        if (!window.dataManager) return;

        if (confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
            try {
                await window.dataManager.deleteGoal(goalId);
                await this.loadGoals();
                this.updateGoalsView();
                showNotification('Hedef silindi!', 'success');
            } catch (error) {
                console.error('Hedef silinirken hata:', error);
                showNotification('Silme işlemi sırasında hata oluştu!', 'error');
            }
        }
    }

    toggleFoodCompletion(element) {
        const isCompleted = element.classList.contains('completed');
        const foodKey = element.getAttribute('data-food');
        
        if (isCompleted) {
            element.classList.remove('completed');
            element.textContent = '';
            delete this.nutritionProgress[foodKey];
        } else {
            element.classList.add('completed');
            element.textContent = '✓';
            this.nutritionProgress[foodKey] = true;
        }

        // Veri tabanına kaydet
        if (window.dataManager) {
            const nutritionData = {
                foodName: foodKey,
                completed: !isCompleted,
                date: new Date().toISOString().split('T')[0]
            };
            
            window.dataManager.addNutritionLog(nutritionData);
        }

        showNotification(
            isCompleted ? 'Yiyecek tamamlanmamış olarak işaretlendi' : 'Yiyecek tamamlandı!',
            isCompleted ? 'warning' : 'success'
        );
    }

    updateDailyCalories() {
        const calorieValues = {
            breakfast: 800,
            lunch: 1000,
            dinner: 1200,
            snacks: 500
        };

        let totalCalories = 0;
        
        Object.keys(calorieValues).forEach(mealId => {
            const checkbox = document.getElementById(mealId);
            if (checkbox && checkbox.checked) {
                totalCalories += calorieValues[mealId];
            }
        });

        document.getElementById('totalCalories').textContent = totalCalories;
        
        const target = parseInt(document.getElementById('calorieTarget').textContent);
        const progressPercentage = (totalCalories / target) * 100;
        
        // Kalori rengini güncelle
        const caloriesElement = document.getElementById('totalCalories');
        if (progressPercentage >= 90) {
            caloriesElement.style.color = 'var(--success)';
        } else if (progressPercentage >= 70) {
            caloriesElement.style.color = 'var(--warning)';
        } else {
            caloriesElement.style.color = 'var(--danger)';
        }
    }

    completeDay() {
        // Günü tamamla işlemi
        showNotification('Gün başarıyla tamamlandı!', 'success');
        
        // Kalori takibini kaydet
        if (window.dataManager) {
            const nutritionData = {
                date: new Date().toISOString().split('T')[0],
                totalCalories: parseInt(document.getElementById('totalCalories').textContent),
                targetCalories: parseInt(document.getElementById('calorieTarget').textContent)
            };
            
            window.dataManager.addNutritionLog(nutritionData);
        }
    }

    setupCalendar() {
        // Takvim günlerini oluştur
        this.generateCalendarDays();
        
        // Takvim navigasyon butonları
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendarView();
        });

        document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendarView();
        });
    }

    generateCalendarDays() {
        const calendar = document.querySelector('.calendar-grid');
        if (!calendar) return;

        // Mevcut calendar day header'ları koru, sadece günleri ekle
        const existingHeaders = calendar.querySelectorAll('.calendar-day-header');
        
        // Takvim günlerini temizle (header'ları tutarak)
        const dayElements = calendar.querySelectorAll('.calendar-day');
        dayElements.forEach(day => day.remove());

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Pazartesi'den başla

        for (let i = 0; i < 42; i++) { // 6 hafta x 7 gün
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (currentDate.getMonth() === month) {
                dayElement.innerHTML = `
                    <div class="day-number">${currentDate.getDate()}</div>
                    <div class="status-indicators">
                        <span class="workout-indicator" style="display: none;"></span>
                        <span class="diet-indicator" style="display: none;"></span>
                    </div>
                `;
                
                // Antrenman günü kontrolü (Pazartesi, Salı, Çarşamba, Cuma, Cumartesi)
                const dayOfWeek = currentDate.getDay();
                if ([1, 2, 3, 5, 6].includes(dayOfWeek)) {
                    dayElement.classList.add('workout-day');
                    dayElement.querySelector('.workout-indicator').style.display = 'inline-block';
                }
                
                // Bugün işaretleme
                const today = new Date();
                if (currentDate.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
            } else {
                dayElement.style.opacity = '0.3';
                dayElement.innerHTML = `<div class="day-number">${currentDate.getDate()}</div>`;
            }
            
            calendar.appendChild(dayElement);
        }
    }

    updateCalendarView() {
        const monthNames = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        
        const currentMonthYear = document.getElementById('currentMonthYear');
        if (currentMonthYear) {
            currentMonthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
        
        this.generateCalendarDays();
    }

    switchCalendarView(view) {
        // Aktif view butonunu güncelle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // View'ları göster/gizle
        document.getElementById('monthlyView').style.display = view === 'monthly' ? 'block' : 'none';
        document.getElementById('yearlyView').style.display = view === 'yearly' ? 'block' : 'none';
        document.getElementById('dailyView').style.display = view === 'daily' ? 'block' : 'none';

        if (view === 'daily') {
            const today = new Date();
            document.getElementById('dailyDate').textContent = today.toLocaleDateString('tr-TR');
        }
    }

    saveDailyNotes() {
        const notes = document.getElementById('dailyNotes').value;
        if (!notes.trim()) {
            showNotification('Lütfen not giriniz!', 'warning');
            return;
        }

        // LocalStorage'a kaydet (geliştirilmesi gereken kısım)
        const notesData = {
            date: new Date().toISOString().split('T')[0],
            notes: notes
        };

        const existingNotes = JSON.parse(localStorage.getItem('dailyNotes') || '[]');
        existingNotes.push(notesData);
        localStorage.setItem('dailyNotes', JSON.stringify(existingNotes));

        showNotification('Notlar kaydedildi!', 'success');
        document.getElementById('dailyNotes').value = '';
    }

    setupExportButtons() {
        // Export butonlarını ekleyelim
        const exportContainer = document.createElement('div');
        exportContainer.innerHTML = `
            <div class="card" style="margin-top: 30px;">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-download"></i> Veri Dışa Aktarma</h2>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button class="btn" onclick="app.exportData('workouts')">
                        <i class="fas fa-dumbbell"></i> Antrenman Kayıtları
                    </button>
                    <button class="btn" onclick="app.exportData('measurements')">
                        <i class="fas fa-ruler"></i> Vücut Ölçüleri
                    </button>
                    <button class="btn" onclick="app.exportData('goals')">
                        <i class="fas fa-bullseye"></i> Hedefler
                    </button>
                    <button class="btn" onclick="app.exportData('nutrition')">
                        <i class="fas fa-apple-alt"></i> Beslenme Kayıtları
                    </button>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-outline" onclick="app.backupAllData()">
                        <i class="fas fa-download"></i> Tüm Verileri Yedekle
                    </button>
                    <label class="btn btn-outline" style="cursor: pointer;">
                        <i class="fas fa-upload"></i> Veri Geri Yükle
                        <input type="file" accept=".json" onchange="app.restoreData(this.files[0])" style="display: none;">
                    </label>
                </div>
            </div>
        `;

        // Goals tab'ına ekle
        const goalsTab = document.getElementById('goals');
        if (goalsTab) {
            goalsTab.appendChild(exportContainer);
        }
    }

    async exportData(dataType) {
        if (!window.dataManager) return;

        try {
            const success = await window.dataManager.exportDataToCSV(dataType);
            if (success) {
                showNotification('Veriler başarıyla dışa aktarıldı!', 'success');
            } else {
                showNotification('Dışa aktarma sırasında hata oluştu!', 'error');
            }
        } catch (error) {
            console.error('Export hatası:', error);
            showNotification('Dışa aktarma sırasında hata oluştu!', 'error');
        }
    }

    async backupAllData() {
        if (!window.dataManager) return;

        try {
            const success = await window.dataManager.backupData();
            if (success) {
                showNotification('Tüm veriler başarıyla yedeklendi!', 'success');
            } else {
                showNotification('Yedekleme sırasında hata oluştu!', 'error');
            }
        } catch (error) {
            console.error('Backup hatası:', error);
            showNotification('Yedekleme sırasında hata oluştu!', 'error');
        }
    }

    async restoreData(file) {
        if (!file || !window.dataManager) return;

        if (confirm('Bu işlem mevcut tüm verilerin üzerine yazacak. Devam etmek istediğinizden emin misiniz?')) {
            try {
                await window.dataManager.restoreData(file);
                showNotification('Veriler başarıyla geri yüklendi! Sayfa yenileniyor...', 'success');
                
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } catch (error) {
                console.error('Restore hatası:', error);
                showNotification('Geri yükleme sırasında hata oluştu!', 'error');
            }
        }
    }

    updateUI() {
        this.updateProgressBar();
        this.updateMeasurementsView();
    }

    updateMeasurementsView() {
        // Ölçüm grafiğini güncelle
        this.updateMeasurementsChart();
    }
}

// Global fonksiyonlar
window.editGoal = async function(goalId) {
    // Hedef düzenleme işlevi (implement edilecek)
    console.log('Hedef düzenle:', goalId);
};

window.deleteGoal = async function(goalId) {
    if (window.app) {
        await window.app.deleteGoal(goalId);
    }
};

window.loadWorkoutToForm = function(workout) {
    // Geçmiş antrenman verilerini forma yükle
    document.getElementById('workoutDate').value = workout.date;
    document.getElementById('notes').value = workout.notes || '';
    
    // Set'leri forma yükle
    const setsContainer = document.getElementById('setsContainer');
    setsContainer.innerHTML = '';
    
    workout.sets.forEach(set => {
        addSetRow(set.weight, set.reps);
    });
};

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', function() {
    window.app = new FitnessApp();
});