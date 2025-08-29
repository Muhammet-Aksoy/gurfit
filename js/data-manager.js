/**
 * Fitness App Data Manager
 * Veri kalıcılığı için localStorage ve IndexedDB yöneticisi
 */

class DataManager {
    constructor() {
        this.dbName = 'FitnessAppDB';
        this.dbVersion = 2;
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

                // Ürünler tablosu
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    productStore.createIndex('sku', 'sku', { unique: true });
                    productStore.createIndex('name', 'name', { unique: false });
                    productStore.createIndex('handle', 'handle', { unique: false });
                }

                // Varyantlar tablosu
                if (!db.objectStoreNames.contains('variants')) {
                    const variantStore = db.createObjectStore('variants', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    variantStore.createIndex('productId', 'productId', { unique: false });
                    variantStore.createIndex('sku', 'sku', { unique: true });
                    variantStore.createIndex('variantKey', 'variantKey', { unique: true });
                }

                // Stok hareketleri tablosu
                if (!db.objectStoreNames.contains('stockMovements')) {
                    const movementStore = db.createObjectStore('stockMovements', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    movementStore.createIndex('productId', 'productId', { unique: false });
                    movementStore.createIndex('variantId', 'variantId', { unique: false });
                    movementStore.createIndex('type', 'type', { unique: false });
                    movementStore.createIndex('timestamp', 'timestamp', { unique: false });
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
                products: await this.getAllProducts(),
                variants: await this.getAllVariants(),
                stockMovements: await this.getAllStockMovements(),
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

                    // Envanter verileri (ürünler/varyantlar) varsa güvenli şekilde içe aktar
                    if (backup.products || backup.variants) {
                        await this.importInventoryFromData(backup);
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

    // ---------- Envanter (Ürün, Varyant, Stok) Yönetimi ----------

    normalizeString(value) {
        return (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
    }

    buildProductHandle(product) {
        const base = this.normalizeString(product.handle || product.name || '');
        return base.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    buildVariantKey(product, variant) {
        if (variant && variant.sku) return this.normalizeString(variant.sku);
        const handle = this.buildProductHandle(product);
        const attrs = variant && variant.attributes ? variant.attributes : {};
        const parts = Object.keys(attrs)
            .sort()
            .map(k => `${this.normalizeString(k)}=${this.normalizeString(attrs[k])}`);
        return `${handle}|${parts.join('|')}`;
    }

    async getAllProducts() {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('Database not initialized')); return; }
            const tx = this.db.transaction(['products'], 'readonly');
            const store = tx.objectStore('products');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async getAllVariants() {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('Database not initialized')); return; }
            const tx = this.db.transaction(['variants'], 'readonly');
            const store = tx.objectStore('variants');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async getAllStockMovements() {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('Database not initialized')); return; }
            const tx = this.db.transaction(['stockMovements'], 'readonly');
            const store = tx.objectStore('stockMovements');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async findProductBySkuOrHandle({ sku, handle, name }) {
        if (!this.db) throw new Error('Database not initialized');
        const tx = this.db.transaction(['products'], 'readonly');
        const store = tx.objectStore('products');

        if (sku) {
            try {
                const bySku = await new Promise((resolve, reject) => {
                    const idx = store.index('sku');
                    const req = idx.get(sku);
                    req.onsuccess = () => resolve(req.result || null);
                    req.onerror = () => resolve(null);
                });
                if (bySku) return bySku;
            } catch (_) {}
        }

        const normalizedHandle = this.buildProductHandle({ handle, name });
        if (normalizedHandle) {
            const byHandle = await new Promise((resolve, reject) => {
                const idx = store.index('handle');
                const req = idx.get(normalizedHandle);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (byHandle) return byHandle;
        }

        // Son çare: isimle benzer arama
        if (name) {
            const all = await new Promise((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
            const normName = this.normalizeString(name);
            const match = all.find(p => this.normalizeString(p.name) === normName);
            if (match) return match;
        }

        return null;
    }

    async findVariant(productId, { sku, variantKey, attributes, product }) {
        if (!this.db) throw new Error('Database not initialized');
        const tx = this.db.transaction(['variants'], 'readonly');
        const store = tx.objectStore('variants');

        if (sku) {
            const bySku = await new Promise((resolve) => {
                const idx = store.index('sku');
                const req = idx.get(sku);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (bySku && (!productId || bySku.productId === productId)) return bySku;
        }

        const key = variantKey || this.buildVariantKey(product || {}, { attributes, sku });
        if (key) {
            const byKey = await new Promise((resolve) => {
                const idx = store.index('variantKey');
                const req = idx.get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (byKey && (!productId || byKey.productId === productId)) return byKey;
        }

        return null;
    }

    async upsertProduct(rawProduct) {
        const product = {
            id: rawProduct.id,
            name: rawProduct.name,
            sku: rawProduct.sku || null,
            handle: this.buildProductHandle(rawProduct),
            brand: rawProduct.brand || null,
            category: rawProduct.category || null,
            stock: Number(rawProduct.stock || 0),
            hasVariants: Array.isArray(rawProduct.variants) && rawProduct.variants.length > 0
        };

        const existing = await this.findProductBySkuOrHandle({ sku: product.sku, handle: product.handle, name: product.name });

        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('Database not initialized')); return; }
            const tx = this.db.transaction(['products'], 'readwrite');
            const store = tx.objectStore('products');
            let request;
            if (existing) {
                const updated = { ...existing, ...product, id: existing.id };
                request = store.put(updated);
                request.onsuccess = () => resolve(updated);
                request.onerror = () => reject(request.error);
            } else {
                request = store.add(product);
                request.onsuccess = () => {
                    product.id = request.result;
                    resolve(product);
                };
                request.onerror = () => reject(request.error);
            }
        });
    }

    async upsertVariant(product, rawVariant) {
        const variant = {
            id: rawVariant.id,
            productId: product.id,
            sku: rawVariant.sku || null,
            variantKey: this.buildVariantKey(product, rawVariant),
            attributes: rawVariant.attributes || {},
            stock: Number(rawVariant.stock || 0)
        };

        const existing = await this.findVariant(product.id, { sku: variant.sku, variantKey: variant.variantKey, product });

        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('Database not initialized')); return; }
            const tx = this.db.transaction(['variants'], 'readwrite');
            const store = tx.objectStore('variants');
            let request;
            if (existing) {
                const updated = { ...existing, ...variant, id: existing.id };
                request = store.put(updated);
                request.onsuccess = () => resolve(updated);
                request.onerror = () => reject(request.error);
            } else {
                request = store.add(variant);
                request.onsuccess = () => {
                    variant.id = request.result;
                    resolve(variant);
                };
                request.onerror = () => reject(request.error);
            }
        });
    }

    async importInventoryFromData(data) {
        const productsInput = Array.isArray(data) ? data : (data.products || []);
        const variantsInput = data.variants || [];

        // Ürün listesi içindeki varyantları tercih edin
        for (const p of productsInput) {
            const product = await this.upsertProduct(p);
            if (Array.isArray(p.variants)) {
                for (const v of p.variants) {
                    await this.upsertVariant(product, v);
                }
            }
        }

        // Ayrı gelen varyantları da işle (ürünleri bulup ilişkilendir)
        for (const v of variantsInput) {
            // Ürünü SKU/handle ile bulmaya çalış
            let product = null;
            if (v.productSku) {
                product = await this.findProductBySkuOrHandle({ sku: v.productSku });
            }
            if (!product && v.productName) {
                product = await this.findProductBySkuOrHandle({ name: v.productName });
            }
            if (!product && v.product) {
                product = await this.upsertProduct(v.product);
            }
            if (product) {
                await this.upsertVariant(product, v);
            }
        }

        return true;
    }

    async adjustStock({ productSku = null, productName = null, variantSku = null, attributes = null, quantity = 0, type = 'adjust', reference = null }) {
        if (!this.db) throw new Error('Database not initialized');
        if (!quantity || typeof quantity !== 'number') throw new Error('Geçersiz miktar');

        // Ürün/varyant çözümle
        const product = await this.findProductBySkuOrHandle({ sku: productSku, name: productName });
        if (!product) throw new Error('Ürün bulunamadı');

        let variant = null;
        if (variantSku || attributes) {
            variant = await this.findVariant(product.id, { sku: variantSku, attributes, product });
            if (!variant && attributes) {
                // Varyant yoksa oluşturma YAPMA: kopya oluşumunu engelle
                throw new Error('Varyant bulunamadı');
            }
        }

        // Stok güncelleme
        await new Promise((resolve, reject) => {
            const tx = this.db.transaction(['products', 'variants', 'stockMovements'], 'readwrite');
            const productStore = tx.objectStore('products');
            const variantStore = tx.objectStore('variants');
            const movementStore = tx.objectStore('stockMovements');

            const movement = {
                productId: product.id,
                variantId: variant ? variant.id : null,
                type,
                quantity,
                reference: reference || null,
                timestamp: Date.now()
            };

            const updateEntity = (entity, store) => {
                const updated = { ...entity, stock: Number(entity.stock || 0) + quantity };
                const putReq = store.put(updated);
                putReq.onerror = () => reject(putReq.error);
                putReq.onsuccess = () => {
                    const addMv = movementStore.add(movement);
                    addMv.onerror = () => reject(addMv.error);
                    addMv.onsuccess = () => resolve(true);
                };
            };

            if (variant) {
                updateEntity(variant, variantStore);
            } else {
                updateEntity(product, productStore);
            }
        });

        return true;
    }

    async recordSale({ productSku, productName, variantSku, attributes, quantity, reference }) {
        const qty = -Math.abs(Number(quantity || 0));
        return this.adjustStock({ productSku, productName, variantSku, attributes, quantity: qty, type: 'sale', reference });
    }

    async recordReturn({ productSku, productName, variantSku, attributes, quantity, reference }) {
        const qty = Math.abs(Number(quantity || 0));
        return this.adjustStock({ productSku, productName, variantSku, attributes, quantity: qty, type: 'return', reference });
    }

    // yedekveriler.json içe aktarma (sadece envanter)
    async importInventoryFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    await this.importInventoryFromData(data);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}

// Global DataManager örneği
window.dataManager = new DataManager();