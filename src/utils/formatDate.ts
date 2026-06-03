export const formatTime = (dateStr: any): string => {
  let date: Date;

  if (dateStr?.toDate) {
    date = dateStr.toDate();
  } else if (dateStr?._seconds) {
    // Firestore serializado con guión bajo
    date = new Date(dateStr._seconds * 1000);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};