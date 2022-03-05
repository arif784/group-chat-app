$(document).ready(function() {
  $('#join-btn').on('click', function() {
    const username = $('#login-username').val().trim();
    if (!username || !username.length) {
      return alert('Please enter username');
    }
    $.ajax({
      method: 'POST',
      url: '/api/user/create',
      data: { username },
      dataType: 'json',
    }).done(function(response) {
      console.log('response', response);
      window.sessionStorage.setItem('loginUser', JSON.stringify(response));
      const url = `/chat`;
      $(location).attr('href', url);
    }).catch(function(error) {
      console.log('error', error);
    });
  });
});