        // Import the functions you need from the SDKs you need
        import { initializeApp } from 'firebase/app';
        import { getFirestore, doc, setDoc } from 'firebase/firestore';

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCyiY1Os2gQqye3mnmynA6aHzPdrp7nV5w",
            authDomain: "fs105-61c8e.firebaseapp.com",
            projectId: "fs105-61c8e",
            storageBucket: "fs105-61c8e.appspot.com",
            messagingSenderId: "1074062677808",
            appId: "1:1074062677808:web:4a45569328d4b89e9f5af5",
            measurementId: "G-EKJEDP6V6D"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        document.addEventListener('DOMContentLoaded', function () {
            const sections = document.querySelectorAll('section');
            const buttons = document.querySelectorAll('button');
            const form = document.getElementById('jobForm');
            const stepItems = document.querySelectorAll('.step-wizard-item');
        
            let currentSectionIndex = 0;
        
            function showSection(index) {
                sections.forEach((section, idx) => {
                    section.style.display = idx === index ? 'block' : 'none';
                });
                updateStepIndicator(index);
            }
        
            function updateStepIndicator(index) {
                stepItems.forEach((item, idx) => {
                    if (idx < index) {
                        item.classList.remove('current-item');
                        item.classList.add('completed');
                    } else if (idx === index) {
                        item.classList.add('current-item');
                        item.classList.remove('completed');
                    } else {
                        item.classList.remove('current-item');
                        item.classList.remove('completed');
                    }
                });
            }
        
            function validateCurrentSection() {
                const currentSection = sections[currentSectionIndex];
                const inputs = currentSection.querySelectorAll('input[required], textarea[required]');
        
                for (let input of inputs) {
                    if (!input.value) {
                        return false;
                    }
                }
                return true;
            }
        
            buttons.forEach(button => {
                button.addEventListener('click', function () {
                    if (this.classList.contains('next-section')) {
                        if (validateCurrentSection()) {
                            currentSectionIndex++;
                            showSection(currentSectionIndex);
                        } else {
                            alert('Please fill in all required fields.');
                        }
                    } else if (this.classList.contains('prev-section')) {
                        currentSectionIndex--;
                        showSection(currentSectionIndex);
                    }
                });
            });
        
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
        
                const jobData = {
                    jobTitle: form.jobTitle.value,
                    workingLocation: form.workingLocation.value,
                    workingHours: form.workingHours.value,
                    employmentType: form.employmentType.value,
                    workingDaysPerWeek: form.workingDaysPerWeek.value,
                    paidBreak: form.paidBreak.value,
                    breakDuration: form.breakDuration.value,
                    hourlyRate: form.hourlyRate.value,
                    flatRate: form.flatRate.value,
                    weekdayRate: form.weekdayRate.value,
                    weekendRate: form.weekendRate.value,
                    workingPeriodDays: form.workingPeriodDays.value,
                    dateOfCommencement: form.dateOfCommencement.value,
                    jobDescription: form.jobDescription.value,
                    jobRequirements: form.jobRequirements.value,
                    additionalInfo: form.additionalInfo.value
                };
        
                try {
                    const docRef = await setDoc(doc(db, "jobs", jobData.jobTitle), jobData);
                    alert("Job posting created successfully!");
                } catch (e) {
                    console.error("Error adding document: ", e);
                    alert("Error creating job posting.");
                }
            });
        
            showSection(currentSectionIndex);
        });