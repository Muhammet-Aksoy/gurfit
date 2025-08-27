/**
 * Fitness App Data Manager
 * Veri kalıcılığı için localStorage ve IndexedDB yöneticisi
 */

class DataManager {
    constructor() {
        this.dbName = 'FitnessAppDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    // IndexedDB başlatma
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB açılırken hata:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB başarıyla açıldı');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Antrenman kayıtları tablosu
                if (!db.objectStoreNames.contains('workouts')) {
                    const workoutStore = db.createObjectStore('workouts', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    workoutStore.createIndex('date', 'date', { unique: false });
                    workoutStore.createIndex('exercise', 'exercise', { unique: false });
                }

                // Vücut ölçüleri tablosu
                if (!db.objectStoreNames.contains('measurements')) {
                    const measurementStore = db.createObjectStore('measurements', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    measurementStore.createIndex('date', 'date', { unique: false });
                }

                // Hedefler tablosu
                if (!db.objectStoreNames.contains('goals')) {
                    const goalStore = db.createObjectStore('goals', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                }

                // Beslenme kayıtları tablosu
                if (!db.objectStoreNames.contains('nutrition')) {
                    const nutritionStore = db.createObjectStore('nutrition', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    nutritionStore.createIndex('date', 'date', { unique: false });
                }

                // Antrenman günleri durumu
                if (!db.objectStoreNames.contains('workoutDays')) {
                    const workoutDayStore = db.createObjectStore('workoutDays', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    workoutDayStore.createIndex('date', 'date', { unique: true });
                }
            };
        });
    }

    // LocalStorage yönetimi
    setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('LocalStorage kaydetme hatası:', error);
            return false;
        }
    }

    getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('LocalStorage okuma hatası:', error);
            return null;
        }
    }

    // Kullanıcı verilerini kaydetme
    saveUserData(userData) {
        this.setLocalData('userData', userData);
    }

    // Kullanıcı verilerini yükleme
    getUserData() {
        const defaultData = {
            name: "Kullanıcı",
            level: "Orta",
            weight: 0,
            initialWeight: 0,
            benchPress: 0,
            squat: 0,
            completedWorkouts: 0,
            streak: 0,
            totalWorkouts: 0
        };
        
        const userData = this.getLocalData('userData');
        return userData ? { ...defaultData, ...userData } : defaultData;
    }

    // Antrenman kaydı ekleme
    async addWorkoutLog(workoutData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['workouts'], 'readwrite');
            const store = transaction.objectStore('workouts');
            
            const data = {
                ...workoutData,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0]
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('Antrenman kaydı eklendi:', data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Antrenman kaydı eklenirken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Antrenman kayıtlarını getirme
    async getWorkoutLogs(exerciseName = null) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['workouts'], 'readonly');
            const store = transaction.objectStore('workouts');
            
            let request;
            if (exerciseName) {
                const index = store.index('exercise');
                request = index.getAll(exerciseName);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };

            request.onerror = () => {
                console.error('Antrenman kayıtları alınırken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Vücut ölçümü ekleme
    async addMeasurement(measurementData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['measurements'], 'readwrite');
            const store = transaction.objectStore('measurements');
            
            const data = {
                ...measurementData,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0]
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('Ölçüm kaydı eklendi:', data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Ölçüm kaydı eklenirken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Vücut ölçümlerini getirme
    async getMeasurements() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['measurements'], 'readonly');
            const store = transaction.objectStore('measurements');
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };

            request.onerror = () => {
                console.error('Ölçüm kayıtları alınırken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Hedef ekleme
    async addGoal(goalData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['goals'], 'readwrite');
            const store = transaction.objectStore('goals');
            
            const data = {
                ...goalData,
                timestamp: Date.now(),
                created: new Date().toISOString()
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('Hedef eklendi:', data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Hedef eklenirken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Hedefleri getirme
    async getGoals() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['goals'], 'readonly');
            const store = transaction.objectStore('goals');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Hedefler alınırken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Hedef güncelleme
    async updateGoal(id, updateData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['goals'], 'readwrite');
            const store = transaction.objectStore('goals');
            
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const goal = getRequest.result;
                if (goal) {
                    const updatedGoal = { ...goal, ...updateData };
                    const updateRequest = store.put(updatedGoal);
                    
                    updateRequest.onsuccess = () => {
                        resolve(updatedGoal);
                    };
                    
                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error('Goal not found'));
                }
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    // Hedef silme
    async deleteGoal(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['goals'], 'readwrite');
            const store = transaction.objectStore('goals');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Antrenman günü durumu kaydetme
    async saveWorkoutDayStatus(dayId, completed = true) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['workoutDays'], 'readwrite');
            const store = transaction.objectStore('workoutDays');
            
            const data = {
                dayId: dayId,
                date: new Date().toISOString().split('T')[0],
                completed: completed,
                timestamp: Date.now()
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log('Antrenman günü durumu kaydedildi:', data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Antrenman günü durumu kaydedilirken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Antrenman günü durumunu getirme
    async getWorkoutDayStatus(date = null) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['workoutDays'], 'readonly');
            const store = transaction.objectStore('workoutDays');
            
            if (date) {
                const index = store.index('date');
                const request = index.get(date);
                
                request.onsuccess = () => {
                    resolve(request.result || null);
                };
            } else {
                const request = store.getAll();
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
            }

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Beslenme kaydı ekleme
    async addNutritionLog(nutritionData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['nutrition'], 'readwrite');
            const store = transaction.objectStore('nutrition');
            
            const data = {
                ...nutritionData,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0]
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('Beslenme kaydı eklendi:', data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Beslenme kaydı eklenirken hata:', request.error);
                reject(request.error);
            };
        });
    }

    // Beslenme kayıtlarını getirme
    async getNutritionLogs(date = null) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['nutrition'], 'readonly');
            const store = transaction.objectStore('nutrition');
            
            if (date) {
                const index = store.index('date');
                const request = index.getAll(date);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
            } else {
                const request = store.getAll();
                
                request.onsuccess = () => {
                    const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
                    resolve(results);
                };
            }

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Veriyi CSV olarak dışa aktarma
    async exportDataToCSV(dataType) {
        try {
            let data = [];
            let headers = [];
            let filename = '';

            switch (dataType) {
                case 'workouts':
                    data = await this.getWorkoutLogs();
                    headers = ['Tarih', 'Egzersiz', 'Ağırlık', 'Tekrar', 'Set', 'Notlar'];
                    filename = 'antrenman_kayitlari.csv';
                    break;
                case 'measurements':
                    data = await this.getMeasurements();
                    headers = ['Tarih', 'Göğüs', 'Kol', 'Bel', 'Kalça', 'Bacak', 'Baldır'];
                    filename = 'vucut_olculeri.csv';
                    break;
                case 'goals':
                    data = await this.getGoals();
                    headers = ['Hedef Adı', 'Şu anki Değer', 'Hedef Değer', 'İlerleme', 'Oluşturulma Tarihi'];
                    filename = 'hedefler.csv';
                    break;
                case 'nutrition':
                    data = await this.getNutritionLogs();
                    headers = ['Tarih', 'Yiyecek', 'Kalori', 'Tamamlandı'];
                    filename = 'beslenme_kayitlari.csv';
                    break;
                default:
                    throw new Error('Geçersiz veri tipi');
            }

            const csvContent = this.convertToCSV(data, headers, dataType);
            this.downloadCSV(csvContent, filename);
            
            return true;
        } catch (error) {
            console.error('CSV dışa aktarma hatası:', error);
            return false;
        }
    }

    // Veriyi CSV formatına çevirme
    convertToCSV(data, headers, dataType) {
        const rows = [headers.join(',')];
        
        data.forEach(item => {
            let row = [];
            
            switch (dataType) {
                case 'workouts':
                    row = [
                        item.date,
                        item.exercise,
                        item.sets?.map(set => `${set.weight}kg`).join(';') || '',
                        item.sets?.map(set => `${set.reps} tekrar`).join(';') || '',
                        item.sets?.length || 0,
                        item.notes || ''
                    ];
                    break;
                case 'measurements':
                    row = [
                        item.date,
                        item.chest || '',
                        item.arm || '',
                        item.waist || '',
                        item.hip || '',
                        item.leg || '',
                        item.calf || ''
                    ];
                    break;
                case 'goals':
                    const progress = item.targetValue ? ((item.currentValue / item.targetValue) * 100).toFixed(1) : 0;
                    row = [
                        item.name,
                        item.currentValue,
                        item.targetValue,
                        `${progress}%`,
                        item.created
                    ];
                    break;
                case 'nutrition':
                    row = [
                        item.date,
                        item.foodName,
                        item.calories,
                        item.completed ? 'Evet' : 'Hayır'
                    ];
                    break;
            }
            
            rows.push(row.map(field => `"${field}"`).join(','));
        });
        
        return rows.join('\n');
    }

    // CSV dosyasını indirme
    downloadCSV(csvContent, filename) {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Veritabanını yedekleme
    async backupData() {
        try {
            const backup = {
                userData: this.getUserData(),
                workouts: await this.getWorkoutLogs(),
                measurements: await this.getMeasurements(),
                goals: await this.getGoals(),
                nutrition: await this.getNutritionLogs(),
                workoutDays: await this.getWorkoutDayStatus(),
                timestamp: Date.now()
            };

            const backupJson = JSON.stringify(backup, null, 2);
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `fitness_app_backup_${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Yedekleme hatası:', error);
            return false;
        }
    }

    // Veritabanını geri yükleme
    async restoreData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Kullanıcı verilerini geri yükle
                    if (backup.userData) {
                        this.saveUserData(backup.userData);
                    }

                    // Diğer verileri geri yükle
                    if (backup.workouts) {
                        for (const workout of backup.workouts) {
                            await this.addWorkoutLog(workout);
                        }
                    }

                    if (backup.measurements) {
                        for (const measurement of backup.measurements) {
                            await this.addMeasurement(measurement);
                        }
                    }

                    if (backup.goals) {
                        for (const goal of backup.goals) {
                            await this.addGoal(goal);
                        }
                    }

                    if (backup.nutrition) {
                        for (const nutrition of backup.nutrition) {
                            await this.addNutritionLog(nutrition);
                        }
                    }

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(reader.error);
            };

            reader.readAsText(file);
        });
    }
}

// Global DataManager örneği
window.dataManager = new DataManager();