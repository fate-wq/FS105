document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('section');
    const buttons = document.querySelectorAll('button');
    const form = document.getElementById('jobForm');
    const stepItems = document.querySelectorAll('.step-wizard-item');
    const workingLocation = document.getElementById('workingLocation');
    const employmentType = document.getElementById('employmentType');
    const locations = document.getElementById('locations').options;
    const employmentTypes = document.getElementById('employmentTypes').options;

    // Function to filter datalist options based on input value
    const filterOptions = (input, options) => {
        const value = input.value.toLowerCase();
        for (let option of options) {
            option.style.display = option.value.toLowerCase().startsWith(value) ? 'block' : 'none';
        }
    };

    // Function to validate input against datalist options and set custom validity
    const validateInput = (input, options) => {
        const value = input.value.toLowerCase();
        let isValid = false;
        for (let option of options) {
            if (option.value.toLowerCase() === value) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            input.setCustomValidity('Please select a valid option from the list.');
        } else {
            input.setCustomValidity('');
        }
        return isValid;
    };

    // Event listener for input in working location field
    workingLocation.addEventListener('input', () => {
        filterOptions(workingLocation, locations);
    });

    // Event listener for input in employment type field
    employmentType.addEventListener('input', () => {
        filterOptions(employmentType, employmentTypes);
    });

    // Event listener for change in working location field
    workingLocation.addEventListener('change', () => {
        validateInput(workingLocation, locations);
    });

    // Event listener for change in employment type field
    employmentType.addEventListener('change', () => {
        validateInput(employmentType, employmentTypes);
    });

    let currentSectionIndex = 0;

    // Load draft data from localStorage if available
    const draftData = JSON.parse(localStorage.getItem('jobFormDraft'));
    if (draftData) {
        Object.keys(draftData).forEach(key => {
            const input = form[key];
            if (input) {
                input.value = draftData[key];
            }
        });
    }

    function showSection(index) {
        sections.forEach((section, idx) => {
            section.style.display = idx === index ? 'block' : 'none';
        });
        updateStepIndicator(index);
        smoothScroll();
    }

    function updateStepIndicator(index) {
        stepItems.forEach((item, idx) => {
            item.classList.remove('completed', 'current-item');
            if (idx < index) {
                item.classList.add('completed');
            } else if (idx === index) {
                item.classList.add('current-item');
            }
        });
    }

    function smoothScroll() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateCurrentSection() {
        const currentSection = sections[currentSectionIndex];
        const inputs = currentSection.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value) {
                input.classList.add('invalid');
                isValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });
        return isValid;
    }

    // Event listener for button clicks (Next/Previous)
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (button.classList.contains('next-section')) {
                if (validateCurrentSection()) {
                    // Validate working location and employment type before proceeding to next section
                    const isLocationValid = validateInput(workingLocation, locations);
                    const isEmploymentTypeValid = validateInput(employmentType, employmentTypes);
                    
                    if (isLocationValid && isEmploymentTypeValid) {
                        currentSectionIndex++;
                        showSection(currentSectionIndex);
                    } else {
                        // Display alert if inputs are invalid
                        alert('Please select a valid option from the list.');
                    }
                } else {
                    // Display alert if required fields are not filled
                    alert('Please fill in all required fields.');
                }
            } else if (button.classList.contains('prev-section')) {
                currentSectionIndex--;
                showSection(currentSectionIndex);
            }
        });
    });

    // Auto-save form data to localStorage
    form.addEventListener('input', () => {
        const formData = new FormData(form);
        const draftData = {};
        formData.forEach((value, key) => {
            draftData[key] = value;
        });
        localStorage.setItem('jobFormDraft', JSON.stringify(draftData));
        console.log('Draft saved.');
    });

    // Clear form and localStorage after submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Confirmation dialog before submission
        if (!confirm('Are you sure you want to submit the form?')) {
            return;
        }

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
            jobDescription1: form.jobDescription1.value,
            jobDescription2: form.jobDescription2.value,
            jobDescription3: form.jobDescription3.value,
            jobDescription4: form.jobDescription4.value,
            jobDescription5: form.jobDescription5.value,
            jobRequirement1: form.jobRequirement1.value,
            jobRequirement2: form.jobRequirement2.value,
            jobRequirement3: form.jobRequirement3.value
        };

        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });
            const result = await response.json();
            console.log(result);
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error creating job posting.");
            return;
        }

        setTimeout(() => {
            alert('Form submitted successfully!');
            form.reset(); // Clear form inputs
            localStorage.removeItem('jobFormDraft'); 
            currentSectionIndex = 0; 
            showSection(currentSectionIndex); 
        }, 500);
    });

    showSection(currentSectionIndex);
});
