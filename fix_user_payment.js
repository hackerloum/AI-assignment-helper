// Quick script to fix the payment for order: b9c4decc-4b8b-4304-a08f-ecaf61ea2123
// Run this in browser console at: https://ai-assignment-helper-three.vercel.app

console.log('🔧 Fixing payment for order: b9c4decc-4b8b-4304-a08f-ecaf61ea2123');

fetch('https://ai-assignment-helper-three.vercel.app/api/admin/mark-paid', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: 'b9c4decc-4b8b-4304-a08f-ecaf61ea2123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Response:', data);
  
  if (data.success) {
    console.log('✅✅✅ ACCOUNT FIXED! ✅✅✅');
    console.log('User has been marked as paid:', data.data);
    alert('✅ Your account has been fixed! You can now access the dashboard.\n\nClick OK to redirect to dashboard.');
    
    // Redirect to dashboard
    window.location.href = 'https://ai-assignment-helper-three.vercel.app/dashboard';
  } else {
    console.error('❌ Fix failed:', data.error);
    alert('Fix failed. See console for details.');
  }
})
.catch(error => {
  console.error('❌ Error:', error);
  alert('Error occurred. Check console.');
});

