import "./StandardList.css";
import { useEffect, useState } from "react";
import { loadDeletedTasks, loadCategories, loadUsers } from "../../utilities/services";
import { userStore, usernameStore } from "../../stores/userStore";
import NonDraggableTask from "../cards/NonDraggableTask";
import CategoryCard from "../cards/CategoryCard";
import AddCategory from "../addCategoryDiv/AddCategory";
import ModalEditTask from "../somemodals/ModalEditTask";
import UserCard from "../cards/UserCard";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useMediaQuery } from "react-responsive";

export default function StandardList({ type }) {
   const user = userStore.getState().user;
   const [deletedTasks, setDeletedTasks] = useState([]);
   const [fetchTrigger, setFetchTrigger] = useState(false);
   const [categoryList, setCategoryList] = useState([]);
   const [taskData, setTaskData] = useState({});
   const [modalEditVisibility, setModalEditVisibility] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [searchCategory, setSearchCategory] = useState("");
   const [searchUser, setSearchUser] = useState("");
   const [userCards, setUserCards] = useState([]);
   const navigate = useNavigate();
   const usernameStorage = usernameStore.getState().username;
   const isComputer = useMediaQuery({ query: "(min-width: 900px)" });

   //fetch the deleted tasks or categories, depending on the page
   useEffect(() => {
      if (type === "taskList") {
         loadDeletedTasks(user.token).then((response) => {
            if (!response.ok) {
               throw new Error("Network response was not ok");
            }
            return response.json().then((data) => {
               setDeletedTasks(data);
            });
         });
      } else if (type === "categoriesList") {
         loadCategories(user.token).then((response) => {
            if (!response.ok) {
               throw new Error("Network response was not ok");
            }
            return response.json().then((data) => {
               setCategoryList(data);
            });
         });
      } else if (type === "usersList") {
         loadUsers(user.token).then((response) => {
            if (!response.ok) {
               throw new Error("Network response was not ok");
            }
            return response.json().then((data) => {
               setUserCards(data);
            });
         });
      }
   }, [fetchTrigger]);

   //function to handle the double click on a task, it will create the modal to edit the task
   const handleTaskDoubleClick = (taskData) => {
      setModalEditVisibility(true);
      setTaskData(taskData);
   };

   const handleTaskClick = (taskData) => {
      setModalEditVisibility(true);
      setTaskData(taskData);
   };
   return (
      <div className="mainBoard-settings" id="mainBoard-settings">
         <div className="user-list">
            <div className="box-container" id="box-deletedTasks">
               {type === "taskList" ? (
                  <>
                     <div id="title-deleted-tasks" className="banner_register">
                        <p id="user-list">
                           <i class="bi bi-trash"></i>&nbsp;&nbsp;List of Deleted Tasks
                        </p>
                     </div>
                     <div className="search-container" id="search-container-deleted">
                        <input
                           type="text"
                           id="taskSearch"
                           placeholder="🔍 Search tasks by title or description"
                           value={searchTerm}
                           className="list-searchBar form-control"
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </>
               ) : type === "categoriesList" ? (
                  <>
                     <div id="title-deleted-tasks" className="banner_register">
                        <p id="user-list">
                           <i class="bi bi-tags"></i>&nbsp;&nbsp;List of Categories
                        </p>
                     </div>
                     <div className="search-container" id="search-container-deleted">
                        <input
                           type="text"
                           id="taskSearch"
                           placeholder="🔍 Search categories"
                           value={searchCategory}
                           className="list-searchBar form-control"
                           onChange={(e) => setSearchCategory(e.target.value)}
                        />
                        <AddCategory setCategoryList={setCategoryList} />
                     </div>
                  </>
               ) : (
                  type === "usersList" && (
                     <>
                        <div id="title-deleted-tasks" className="banner_register">
                           <p id="user-list">
                              <i class="fas fa-users"></i>&nbsp;&nbsp;List of Users
                           </p>
                        </div>

                        <div className="search-container" id="search-container-deleted">
                           <input
                              type="text"
                              id="taskSearch"
                              placeholder="🔍 Search users by username"
                              value={searchUser}
                              className="list-searchBar form-control"
                              onChange={(e) => setSearchUser(e.target.value)}
                           />
                           {user.role !== "developer" && (
                              <Button
                                 id="addUser-btn"
                                 className="btn-outline-primary"
                                 onClick={() => navigate("/register", { state: { type: "productOwnerRegister" } })}
                              >
                                 <i class="fas fa-user-plus"></i>
                                 {isComputer && <span>&nbsp;&nbsp; Add User</span>}
                              </Button>
                           )}
                        </div>
                     </>
                  )
               )}
               <div id="scrollable-div">
                  <ul className="ul-tasks" id="DELETED_COLUMN">
                     {type === "taskList" &&
                        deletedTasks.map((task) => {
                           return (
                              <NonDraggableTask
                                 key={task.id}
                                 id={task.id}
                                 title={task.title}
                                 description={task.description}
                                 priority={task.priority}
                                 startDate={task.startDate}
                                 endDate={task.endDate}
                                 category_type={task.category_type}
                                 username_author={task.username_author}
                                 status={task.status === 100 ? "TO DO" : task.status === 200 ? "DOING" : "DONE"}
                                 setFetchTrigger={setFetchTrigger}
                                 onDoubleClick={handleTaskDoubleClick}
                                 onClick={handleTaskClick}
                                 searchTerm={searchTerm}
                              />
                           );
                        })}

                     {type === "categoriesList" &&
                        categoryList.map((category) => {
                           return (
                              <CategoryCard
                                 key={category.id}
                                 category_type={category.type}
                                 setFetchTrigger={setFetchTrigger}
                                 searchTerm={searchCategory}
                                 tasksNumber={category.tasksNumber}
                              />
                           );
                        })}
                     {type === "usersList" &&
                        userCards.map((userCard) => {
                           return (
                              userCard.username !== "admin" &&
                              userCard.username !== "deletedTasks" &&
                              userCard.username !== "developerTest" &&
                              userCard.username !== "scrumMasterTest" &&
                              userCard.username !== usernameStorage &&
                              (((userCard.deleted || !userCard.confirmed) &&
                                 (user.role === "productOwner" || user.role === "scrumMaster")) ||
                                 (!userCard.deleted && userCard.confirmed)) && (
                                 <UserCard
                                    key={userCard.username}
                                    username={userCard.username}
                                    role={userCard.role}
                                    isDeleted={userCard.deleted}
                                    photoURL={userCard.photoURL}
                                    isConfirmed={userCard.confirmed}
                                    searchTerm={searchUser}
                                 />
                              )
                           );
                        })}
                  </ul>
               </div>
            </div>
         </div>
         {modalEditVisibility && (
            <ModalEditTask
               setModalVisibility={setModalEditVisibility}
               token={user.token}
               data={taskData}
               setFetchTrigger={setFetchTrigger}
               modalType={"deletedTask"}
            />
         )}
      </div>
   );
}
