$(document).ready(function() {
  const socket = io();
  const loginUser = JSON.parse(window.sessionStorage.getItem('loginUser'));
  const username = loginUser.username;
  $('#username').text(`Welcome ${username.toUpperCase()}`);

  function showAddChannelMembersModal(action, channelId) {
    if (action === 'add') {
      $.ajax({
        method: 'GET',
        url: `/api/channel/getAllUsers/${channelId}`,
      }).done(function(users) {
        if (users && users.length) {
          let list = '';
          users.forEach((user) => {
            if (user.username !== loginUser.username) {
              list += `<li class="user-list">
                          <span><input class="user-checkbox" type="checkbox" data-user="${user._id}" data-id="${channelId}" /></span>
                          <span style="margin-left:2rem;">${user.username}</span>
                      </li>`;
            }
          });
          $('#channel-users').html(list);
        }
        $('#add-member').modal('show');
      }).catch(function(error) {
        alert(error.responseText);
      });
    }
  }

  function getChannelChats(_this, channelId) {
    $.ajax({
      method: 'GET',
      url: `/api/channel/chats/${channelId}`,
    }).done(function(chats) {
      const recepientChannel = $('#recepient-label').attr('data-channel');
      if (chats && chats.length) {
        let list = '';
        chats.forEach((chat) => {
          if (chat.channel._id === recepientChannel) {
            list += `<li>
                            <p>${chat.sender.username}   ${new Date(chat.createdAt).toLocaleString()}</p>
                            <p>${chat.message}</p>
                          </li>`;
          }
        });
        $('#chat-list').html(list);
      }
    }).catch(function(error) {
      alert(error.responseText);
    });
  }

  function getChannelMembers(_this, channelId) {
    $.ajax({
      method: 'GET',
      url: `/api/channel/getUsers/${channelId}`,
    }).done(function(response) {
      $('#send-btn').prop('disabled', false);
      $('#chat-list').text('');
      $('#recepient-label').text(response.name.toUpperCase());
      $('#recepient-label').attr('data-channel', channelId);
      $('#recepient-label').attr('data-type', 'channel');
      let userList = '';
      if (response.members && response.members.length) {
        response.members.forEach((member) => {
          if (member._id !== loginUser._id) {
            userList += `<p class="action-item">${member.username}</p>`;
          }
        });
        $('#member-menu').html(userList);
        $('#member-span').show();
      }
    }).catch(function(error) {
      alert(error.responseText);
    });
  }

  function getReceiverChats(roomId) {
    $.ajax({
      method: 'GET',
      url: `/api/chat/receiverChats/${roomId}`,
    }).done(function(chats) {
      if (chats && chats.length) {
        let list = '';
        chats.forEach((chat) => {
          list += `<li>
                      <p>${chat.sender.username}   ${new Date(chat.createdAt).toLocaleString()}</p>
                      <p>${chat.message}</p>
                    </li>`;
        });
        $('#chat-list').html(list);
      }
    }).catch(function(error) {
      alert(error.responseText);
    });
  }

  socket.on('direct-join-res', function(response) {
    const receiverId = response.receiver._id;
    if (loginUser._id === receiverId) {
      const list = `<li class="room-user" data-id="${response._id}">
                          <span class="room-label" data-room="${response._id}" data-id="${receiverId}">${response.sender.username}</span>
                          <span>
                            <i class="material-icons">more_vert</i>
                          </span>
                        </li>`
      $('#room-list').append(list);
      $('.room-label').on('click', function() {
        $('#send-btn').prop('disabled', false);
        $('#chat-list').text('');
        $('#recepient-label').text($(this).text().toUpperCase());
        const receiverId = $(this).attr('data-id');
        const roomId = $(this).attr('data-room');
        $('#recepient-label').attr('data-id', receiverId);
        $('#recepient-label').attr('data-room', roomId);
        $('#recepient-label').attr('data-type', 'direct');
        $('#member-span').hide();
        getReceiverChats(roomId);
      });
    }
  });

  socket.on('direct-msg-res', function(response) {
    const receiverId = response.receiver._id;
    const recepientId = $('#recepient-label').attr('data-id');
    if (receiverId === loginUser._id && recepientId === response.sender._id) {
      const list = `<li>
                      <p>${response.sender.username}   ${new Date(response.createdAt).toLocaleString()}</p>
                      <p>${response.message}</p>
                    </li>`;
      $('#chat-list').append(list);
    }
  });

  socket.on('channel-msg-res', function(chat) {
    const recepientChannel = $('#recepient-label').attr('data-channel');
    if (chat.channel._id === recepientChannel) {
      const list = `<li>
                      <p>${chat.sender.username}   ${new Date(chat.createdAt).toLocaleString()}</p>
                      <p>${chat.message}</p>
                    </li>`;
      $('#chat-list').append(list);
    }
  });

  socket.on('notify-members', function(channel) {
    if (channel.owner !== loginUser._id) {
      const members = channel.members.filter((member) => member === loginUser._id);
      members.forEach((member) => {
        const list = `<li class="channel-item" data-id="${channel._id}">
                <span class="channel-label" data-id="${channel._id}">${channel.name}</span>
                <span class="dropdown">
                  <i class="material-icons dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">more_vert</i>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <p class="action-item" id="add-channel-member" value="add" data-id="${channel._id}">Add member</p>
                  <p class="action-item" id="leave-channel" value="remove" data-id="${channel._id}">Leave Channel</p>
                </div>
                </span>
              </li>`
        $('#channel-list').append(list);
        $('.channel-label').on('click', function() {
          const _this = $(this);
          const channelId = $(this).attr('data-id');
          getChannelMembers(_this, channelId);
          getChannelChats(_this, channelId);
        });
        socket.emit('member-ack', channel._id);
      });
    }
  });

  $.ajax({
    method: 'GET',
    url: `/api/user/roomsAndChannels/${loginUser._id}`,
  }).done(function(response) {
    if (response.userChannels && response.userChannels.length) {
      let list = '';
      response.userChannels.forEach((channel) => {
        list += `<li class="channel-item" data-id="${channel._id}">
                  <span class="channel-label" data-id="${channel._id}">${channel.name}</span>
                  <span class="dropdown">
                    <i class="material-icons dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">more_vert</i>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <p class="action-item" id="add-channel-member" value="add" data-id="${channel._id}">Add member</p>
                    <p class="action-item" id="leave-channel" value="remove" data-id="${channel._id}">Leave Channel</p>
                  </div>
                  </span>
                  </li>`
      });
      $('#channel-list').html(list);

      $('.dropdown-menu').on('click', 'p', function() {
        const action = $(this).attr('value');
        const channelId = $(this).attr('data-id');
        showAddChannelMembersModal(action, channelId);
      });

      $('.channel-label').on('click', function() {
        const _this = $(this);
        const channelId = $(this).attr('data-id');
        getChannelMembers(_this, channelId);
        getChannelChats(_this, channelId);
      });
    }
    if (response.userRooms && response.userRooms.length) {
      let list = '';
      response.userRooms.forEach((room) => {
        let roomName = room.sender.username;
        let receiverId = room.sender._id;
        if (room.sender && room.sender._id === loginUser._id) {
          roomName = room.receiver.username;
          receiverId = room.receiver._id;
        }
        list += `<li class="room-user" data-id="${room._id}">
                  <span class="room-label" data-room="${room._id}" data-id="${receiverId}">${roomName}</span>
                  <span>
                    <i class="material-icons">more_vert</i>
                  </span>
                  </li>`
      });
      $('#room-list').html(list);
      $('.room-label').on('click', function() {
        $('#chat-list').text('');
        $('#send-btn').prop('disabled', false);
        $('#recepient-label').text($(this).text().toUpperCase());
        const receiverId = $(this).attr('data-id');
        const roomId = $(this).attr('data-room');
        $('#recepient-label').attr('data-id', receiverId);
        $('#recepient-label').attr('data-room', roomId);
        $('#recepient-label').attr('data-type', 'direct');
        $('#member-span').hide();
        getReceiverChats(roomId);
      });
    }
  }).catch(function(error) {
    alert(error.responseText);
  });

  $('#create-channel').on('click', function() {
    const channelName = $('#channel-name').val().trim();
    if (!channelName || !channelName.length) {
      return alert('Invalid channel name');
    }
    const payload = {
      name: channelName,
      user: loginUser._id,
    };
    socket.emit('create-channel', payload, function(error, response) {
      if (error) {
        $('#channel').modal('hide');
        return alert(error);
      }
      const list = `<li class="channel-item" data-id="${response._id}">
                <span class="channel-label" data-id="${response._id}">${response.name}</span>
                <span class="dropdown">
                  <i class="material-icons dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">more_vert</i>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <p class="action-item" id="add-channel-member" value="add" data-id="${response._id}">Add member</p>
                  <p class="action-item" id="leave-channel" value="remove" data-id="${response._id}">Leave Channel</p>
                </div>
                </span>
              </li>`
      $('#channel-list').append(list);
      $('#channel').modal('hide');

      $('.channel-label').on('click', function() {
        const _this = $(this);
        const channelId = $(this).attr('data-id');
        getChannelMembers(_this, channelId);
        getChannelChats(_this, channelId);
      });

      $('.dropdown-menu').on('click', 'p', function() {
        const action = $(this).attr('value');
        const channelId = $(this).attr('data-id');
        showAddChannelMembersModal(action, channelId);
      });
    });
  });

  $('#add-room').on('click', function() {
    $.ajax({
      method: 'GET',
      url: `/api/room/getAllUsers/${loginUser._id}`,
    }).done(function(response) {
      if (response && response.length) {
        let list = '';
        response.forEach((user) => {
          if (user.username !== loginUser.username) {
            list += `<li class="room-item" value="${user.username}" data-id="${user._id}">
                      <span>${user.username}</span>
                      <span class="add-action" title="Add User">+</span>
                    </li>`;
          }
        });
        $('#room-users').html(list);

        $('.room-item').on('click', function() {
          const payload = {
            receiver: $(this).attr('data-id'),
            sender: loginUser._id,
          };
          socket.emit('direct-join-req', payload, function(error, room) {
            $('#direct').modal('hide');
            if (error) {
              return alert(error);
            }
            const list = `<li class="room-user" data-id="${room._id}">
                            <span class="room-label" data-room="${room._id}" data-id="${room.receiver._id}">${room.receiver.username}</span>
                            <span>
                              <i class="material-icons">more_vert</i>
                            </span>
                          </li>`
            $('#room-list').append(list);
            $('.room-label').on('click', function() {
              $('#chat-list').text('');
              $('#send-btn').prop('disabled', false);
              $('#recepient-label').text($(this).text().toUpperCase());
              const receiverId = $(this).attr('data-id');
              const roomId = $(this).attr('data-room');
              $('#recepient-label').attr('data-id', receiverId);
              $('#recepient-label').attr('data-room', roomId);
              $('#recepient-label').attr('data-type', 'direct');
              $('#member-span').hide();
              getReceiverChats(roomId);
            });
          });
        });
      }
    }).catch(function(error) {
      alert(error.responseText);
    });
  });

  $('#add-members').on('click', function() {
    const selectedUsers = $('.user-checkbox:checked').map(function() {
      return {
        userId: $(this).attr('data-user'),
        channelId: $(this).attr('data-id'),
      };
    }).get();
    if (selectedUsers && selectedUsers.length) {
      const users = selectedUsers.map((user) => user.userId);
      const payload = {
        channelId: selectedUsers[0].channelId,
        users,
      };
      socket.emit('add-members', payload, function(error) {
        $('#add-member').modal('hide');
        if (error) {
          return alert(error);
        }
      });
    }
  });

  // send message
  $('#send-btn').on('click', function() {
    const msg = $('#msg-box').val().trim();
    if (!msg || !msg.length) {
      return;
    }
    const receiverId = $('#recepient-label').attr('data-id');
    const receiverType = $('#recepient-label').attr('data-type');
    if (receiverType === 'direct') {
      const roomId = $('#recepient-label').attr('data-room');
      const payload = {
        sender: loginUser._id,
        receiver: receiverId,
        message: msg,
        room: roomId,
      };
      socket.emit('direct-msg-send', payload, function(error, res) {
        if (error) {
          return alert(error);
        }
        const list = `<li>
                        <p>${res.sender.username}   ${new Date(res.createdAt).toLocaleString()}</p>
                        <p>${res.message}</p>
                      </li>`;
        $('#chat-list').append(list);
      });
    } else {
      const channelId = $('#recepient-label').attr('data-channel');
      const payload = {
        sender: loginUser._id,
        message: msg,
        channel: channelId,
      };
      socket.emit('channel-msg-send', payload, function(error, chat) {
        if (error) {
          return alert(error);
        }
        const list = `<li>
                        <p>${chat.sender.username}   ${new Date(chat.createdAt).toLocaleString()}</p>
                        <p>${chat.message}</p>
                      </li>`;
        $('#chat-list').append(list);
      });
    }
    $('#msg-box').val('');
  });
});