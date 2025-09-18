
const markBtn = document.getElementById('markAttendanceBtn');
const recordsBody = document.getElementById('recordsBody');
const attendanceStatus = document.getElementById('attendanceStatus');

const studentId = sessionStorage.getItem('studentId'); // assume saved after login
const fullname = sessionStorage.getItem('fullname');   // assume saved after login

// Fetch public IP using API
async function getPublicIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch (err) {
        console.error('Could not fetch IP:', err);
        return '0.0.0.0';
    }
}

// Get geolocation
// function getLocation() {
//     return new Promise((resolve, reject) => {
//         if (!navigator.geolocation) {
//             reject('Geolocation is not supported by your browser');
//         } else {
//             navigator.geolocation.getCurrentPosition(pos => {
//                 resolve({
//                     latitude: pos.coords.latitude,
//                     longitude: pos.coords.longitude
//                 });
//             }, err => {
//                 reject('Permission denied for geolocation');
//             });
//         }
//     });
// }


function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          reject("Permission denied for geolocation");
        },
        {
          enableHighAccuracy: true, // ✅ More accurate (uses GPS if available)
          timeout: 10000,           // ✅ Max wait time (10s)
          maximumAge: 0             // ✅ Always get fresh location
        }
      );
    }
  });
}


// Determine attendance type based on current time
function getAttendanceType() {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Morning: 10:00 - 10:30
    if (hour === 14 && minutes >= 0 && minutes <= 30) {
        return 'morning';
    }

    // Afternoon: 14:00 - 14:30
    if (hour === 15 && minutes >= 0 && minutes <= 30) {
        return 'afternoon';
    }

    return null;
}


// Mark attendance
markBtn.addEventListener('click', async () => {
    const type = getAttendanceType();
    if (!type) {
        Swal.fire({
            icon: 'error',
            title: 'Attendance Not Allowed',
            text: 'You can only mark attendance in the morning (10am-10:30am) or afternoon (2pm-2:30pm).'
        });
        return;
    }

    Swal.fire({
        title: 'Marking Attendance...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const ipAddress = await getPublicIP();
        const { latitude, longitude } = await getLocation();
        console.log(latitude)
        console.log(longitude)

        const res = await fetch('api/attendance/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")
             }`},
            body: JSON.stringify({ studentId, fullname, ipAddress, latitude, longitude, type })
        });

        const result = await res.json();
        Swal.close();

        if (!res.ok) {
            Swal.fire({ icon: 'error', title: 'Failed', text: result.msg });
            return;
        }

        Swal.fire({ icon: 'success', title: 'Success', text: result.msg, timer: 2000, showConfirmButton: false });

        fetchAttendanceRecords(); // refresh table

    } catch (err) {
        Swal.close();
        Swal.fire({ icon: 'error', title: 'Error', text: err });
    }
});





// Fetch attendance records
async function fetchAttendanceRecords() {
    try {
        const res = await fetch("/api/attendance/record", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            // Handle unauthorized or server error
            const errorMsg = await res.json();
            console.error("Fetch error:", errorMsg);
            document.getElementById("recordsBody").innerHTML =
                `<tr><td colspan="5">${errorMsg.message || "Error fetching records"}</td></tr>`;
            return;
        }

        const records = await res.json();
        console.log("Fetched Records:", records);

        const recordsBody = document.getElementById("recordsBody");
        recordsBody.innerHTML = '';

        if (!Array.isArray(records) || records.length === 0) {
            recordsBody.innerHTML = `<tr><td colspan="5">No attendance records yet.</td></tr>`;
            return;
        }

        records.forEach(rec => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rec.date ? new Date(rec.date).toLocaleDateString() : '-'}</td>
                <td>${rec.studentId || '-'}</td>
                <td>${rec.signInTime ? new Date(rec.signInTime).toLocaleTimeString() : '-'}</td>
                <td>${rec.signOutTime ? new Date(rec.signOutTime).toLocaleTimeString() : '-'}</td>
            `;
            recordsBody.appendChild(tr);
        });

    } catch (err) {
        console.error('No attendance records:', err);
    }
}


// Initial load
fetchAttendanceRecords();
