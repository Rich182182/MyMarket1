let UserCore = {
    dataTable: null,
    loadUsers: function () {
        $.ajax({
            url: '/Admin/User/GetUsers',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (UserCore.dataTable) {
                    UserCore.dataTable.clear().rows.add(data.data).draw();
                }
            },
            error: function (xhr) {
                toastr.error("Error loading products: " + xhr.responseText);
            }
        });
    },

};
function loadRoles() {
    $.ajax({
        url: '/Admin/User/GetAllRoles',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const RoleSelectorEdit = $('#editUserRole');
            const RoleSelectorCreate = $('#createUserRole');
            

            RoleSelectorEdit.empty();
            RoleSelectorCreate.empty();

            RoleSelectorEdit.append($('<option value="" selected disabled>---Select Role---</option>'));
            RoleSelectorCreate.append($('<option value="" selected disabled>---Select Role---</option>'));

            $.each(data.data, function (index, role) {
                RoleSelectorEdit.append($('<option></option>').val(role).text(role));
                RoleSelectorCreate.append($('<option></option>').val(role).text(role));
            });
        }
    });
}
function loadCities() {
    $.ajax({
        url: '/Customer/Identity/GetAllCities',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            const CitySelectorEdit = $('#editUserCity');
            const CitySelectorCreate = $('#createUserCity');

            CitySelectorEdit.empty();
            CitySelectorCreate.empty();

            CitySelectorEdit.append($('<option value="" selected disabled>---Select City---</option>'));
            CitySelectorCreate.append($('<option value="" selected disabled>---Select City---</option>'));


            $.each(response.data, function (index, city) {
                CitySelectorEdit.append($('<option></option>').val(city).text(city));
                CitySelectorCreate.append($('<option></option>').val(city).text(city));
            });
        }
    });
}
$(document).ready(function () {
    UserCore.dataTable = $('#userTable').DataTable({
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "all"]],
        "oLanguage": {
            "sSearch": '<i class="bi bi-search"></i> Search:',
            "sLengthMenu": ' Show _MENU_ entries'
        },
        columns: [
            { data: "userName" },
            { data: "firstName" },
            { data: "lastName" },
            { data: "city" },
            { data: "roles" },
            {
                data: null,
                width: '17%',
                orderable: false,
                render: function (data) {
                    let buttons = '<div class="btn-group" role="group">';

                    buttons += '<button type="button" id="editUser" class="btn btn-warning edit-product" ' +
                        'data-id="' + data.id + '" ' +
                        'data-email="' + data.userName + '" ' +
                        'data-firstname="' + data.firstName + '" ' +
                        'data-lastname="' + data.lastName + '" ' +
                        'data-city="' + data.city + '" ' +
                        'data-roles="' + data.roles + '">' +
                        '<i class="bi bi-pencil-square me-1"></i>Edit</button>';

                    buttons += '<button type="button" id="deleteUser" class="btn btn-danger delete-product" ' +
                        'data-id="' + data.id + '" data-name="' + data.userName + '" ' +
                        'data-bs-toggle="modal" data-bs-target="#deleteUserModal">' +
                        '<i class="bi bi-trash me-1"></i>Delete</button>';

                    return buttons;
                }
            }
        ]
    })
});

$(document).ready(function () {
    loadRoles();
    loadCities();
    UserCore.loadUsers();

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('input[type="text"]').trigger('focus');

    });

    $('#createUserForm').on('submit', function (e) {
        e.preventDefault();
        const userData = {
            Name: $('#createUserEmail').val(),
            Password: $('#createUserPassword').val(),
            FirstName: $('#createUserFirstName').val(),
            LastName: $('#createUserLastName').val(),
            City: $('#createUserCity').val(),
            Role: $('#createUserRole').val()
        };

        // Remove the contentType and headers that might be causing issues
        $.ajax({
            url: '/Admin/User/CreateUser',
            type: 'POST',
            data: userData, // Simply pass the object
            success: function (message) {
                if (message.success) {
                    $('#createUserModal').modal('hide');
                    toastr.success("User was created successfully");
                    UserCore.loadUsers();
                }
                else {
                    toastr.error("Error Creating User: " + message.message);
                }
            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr);
                toastr.error("Error Creating User:" + xhr.responseText);
            }
        });
    });


    $(document).on('click', '#editUser', function () {
        const id = $(this).data('id');
        const email = $(this).data('email');
        const firstName = $(this).data('firstname');
        const lastName = $(this).data('lastname');
        const city = $(this).data('city');
        const role = $(this).data('roles');


        $('#editUserId').val(id);
        $('#editUserEmail').val(email);
        $('#editUserRole').val(role);
        $('#editUserFirstName').val(firstName);
        $('#editUserLastName').val(lastName);
        $('#editUserCity').val(city);


        $('#editUserModal').modal('show');
    }); 

    $('#editUserForm').on('submit', function (e) {
        e.preventDefault();
        const userData = {
            id: $('#editUserId').val(),
            Role: $('#editUserRole').val(),
            FirstName: $('#editUserFirstName').val(),
            LastName: $('#editUserLastName').val(),
            City: $('#editUserCity').val()
        };
       
        $.ajax({
            url: '/Admin/User/UpdateUser',
            type: 'POST',
            data: userData,
            success: function (response) {
                if (response.success) {
                    $('#editUserModal').modal('hide');
                    toastr.success(response.message || "User Updated Successfully!");
                    UserCore.loadUsers();
                }
                else {
                    toastr.error(response.message || "Error While Updating User");
                }
            },
            error: function (xhr) {
                toastr.error("Error While Updating User: " + xhr.responseText);
            }
        });
    });

    $(document).on('click', '#deleteUser', function () {
        $('#confirmDeleteUser').data('id', $(this).data('id'));
        $('#deleteUserName').text('User: ' + $(this).data('name'));
    });
    $(document).on('click', '#confirmDeleteUser', function () {
        const userid = $(this).data('id');
        $.ajax({
            url: '/Admin/User/DeleteUser',
            type: 'DELETE',
            data: {
                id: userid
            },
            success: function (response) {
                if (response.success) {
                    $('#deleteUserModal').modal('hide');
                    toastr.success(response.message || "User Deleted Successfully!");
                    UserCore.loadUsers();
                }
                else {
                    toastr.error(response.message || "Error While Deleting User");
                }
            },
            error: function (xhr) {
                toastr.error("error while Deleting User:" + xhr.responseText);
            }
        });
    });
});