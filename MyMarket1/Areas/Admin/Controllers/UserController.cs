using DataAccess.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Models.Identity;

namespace MyMarket1.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class UserController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _db;
        public UserController(AppDbContext db, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _db = db;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public IActionResult Index()
        {
            var roles = _roleManager.Roles.ToList();
            return View(roles);
        }
        public IActionResult GetAllRoles()
        {
            var roles = _roleManager.Roles.Select(r => r.Name).ToList();
            return Json(new { data = roles });
        }
        public IActionResult GetUsers()
        {
            var users = _db.Users.ToList();
            var usersWithRoles = new List<object>();
            foreach (var user in users)
            {
                var roles = _userManager.GetRolesAsync(user).Result;
                usersWithRoles.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.FirstName,
                    user.LastName,
                    user.City,
                    Roles = roles
                });
            }
            return Json(new { data = usersWithRoles });
        }

        
        public class UserVmCreate
        {
            public string Name { get; set; }  // Change from field to property
            public string Password { get; set; }  // Change from field to property
            public string FirstName { get; set; }  // Change from field to property
            public string LastName { get; set; }  // Change from field to property
            public string City { get; set; }  // Change from field to property
            public string Role { get; set; }  // Change from field to property
        }

        [HttpPost]
        public IActionResult CreateUser([FromForm] UserVmCreate uservm)
        {
            var existingUser = _userManager.FindByNameAsync(uservm.Name).GetAwaiter().GetResult();
            if (existingUser != null)
            {
                return Json(new { success = false, message = "User already exists" });
            }

            _userManager.CreateAsync(new ApplicationUser
            {
                UserName = uservm.Name,
                Email = uservm.Name,
                FirstName = uservm.FirstName,
                LastName = uservm.LastName,
                City = uservm.City
            }, uservm.Password).GetAwaiter().GetResult();

            var user = _userManager.FindByNameAsync(uservm.Name).GetAwaiter().GetResult();
            if (user == null)
            {
                throw new Exception("User not Found");
            }

            _userManager.AddToRoleAsync(user, uservm.Role).GetAwaiter().GetResult();

            return Json(new { success = true });
        }
        

        public class UserVmEdit
        {
            public string id { get; set; }
            public string FirstName { get; set; }  // Change from field to property
            public string LastName { get; set; }  // Change from field to property
            public string City { get; set; }  // Change from field to property
            public string Role { get; set; }  // Change from field to property
        }
        [HttpPost]
        public IActionResult UpdateUser([FromForm] UserVmEdit Input)
        {
            var user = _userManager.FindByIdAsync(Input.id).GetAwaiter().GetResult();
            var firstName = user.FirstName;
            var lastName = user.LastName;
            var city = user.City;

            if (Input.FirstName != firstName)
            {
                user.FirstName = Input.FirstName;
            }
            if (Input.LastName != lastName)
            {
                user.LastName = Input.LastName;
            }
            if (Input.City != city)
            {
                user.City = Input.City;
            }
            _db.SaveChanges();
            var roles =  _userManager.GetRolesAsync(user).GetAwaiter().GetResult();
             _userManager.RemoveFromRolesAsync(user, roles).GetAwaiter().GetResult();

             _userManager.AddToRoleAsync(user, Input.Role).GetAwaiter().GetResult();

            return Json(new { success = true});
        }
        [HttpDelete]
        public IActionResult DeleteUser(string id)
        {
            var user = _userManager.FindByIdAsync(id).GetAwaiter().GetResult();
            _userManager.DeleteAsync(user).GetAwaiter().GetResult();
            return Json(new { success = true });
        }
    }
}
