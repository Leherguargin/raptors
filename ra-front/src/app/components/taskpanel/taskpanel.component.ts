import {Component, OnInit} from '@angular/core';
import {RobotTask} from "../../model/Robots/RobotTask";
import {BehaviourService} from "../../services/type/behaviour.service";
import {Behaviour} from "../../model/Robots/Behaviour";
import {TaskPriorityService} from "../../services/type/task-priority.service";
import {TaskPriority} from "../../model/type/TaskPriority";
import {RobotTaskService} from "../../services/robotTask.service";
import {ToastrService} from 'ngx-toastr';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {StoreService} from "../../services/store.service";
import {Robot} from "../../model/Robots/Robot";
import {RobotStatus} from "../../model/Robots/RobotStatus";
import {RobotService} from "../../services/robot.service";
import {RobotStatusService} from "../../services/type/robot-status.service";

@Component({
  selector: 'app-taskpanel',
  templateUrl: './taskpanel.component.html',
  styleUrls: ['./taskpanel.component.css']
})
export class TaskpanelComponent implements OnInit {
  modalID = "taskRobotModal";

  robotTask: RobotTask = new RobotTask(null, null, null, null, null, null, null);
  robot = new Robot(null, null, null, null, null, null, null, null, null);
  robotStatusFree: RobotStatus = new RobotStatus(null);
  robotStatusDuringTask: RobotStatus = new RobotStatus(null);
  behaviours: Behaviour[] = [];
  selectedBehaviour: string;

  taskPriorities: TaskPriority[] = [];
  selectedTaskPriority: string;

  loggedUserID: string;

  constructor(private behaviourService: BehaviourService,
              private taskPriorityService: TaskPriorityService, private robotTaskService: RobotTaskService,
              private toastr: ToastrService, private authService: AuthService, private userService: UserService,
              private storeService: StoreService, private robotService: RobotService, private robotStatusService: RobotStatusService) {
    this.robotTask.behaviours = []
  }

  ngOnInit() {
    this.loggedUserID = JSON.parse(atob(localStorage.getItem('userID')));

    this.behaviourService.getAll().subscribe(
      behaviour => {
        console.log("Pobrane wszystkie zachowania: " + behaviour);
        this.behaviours = behaviour;
        console.log("Pobrane wszystkie tablica: " + this.behaviours);
      }
    );

    this.robotStatusService.getAll().subscribe(statuses=>{
      statuses.forEach(status=>{
        if(status.name==="free"){
          this.robotStatusFree = status;
        }
        if(status.name==="during task"){
          this.robotStatusDuringTask = status;
        }
      })
    });

    this.taskPriorityService.getAll().subscribe(priority => {
        this.taskPriorities = priority;
      }
    );

  }

  selectBehaviour(id: string) {
    console.log("Podczas wyboru: " + this.behaviours);
    this.selectedBehaviour = id;
    this.behaviours.forEach(beha=>{
      if(beha.id === this.selectedBehaviour){
        console.log(beha.name);
        this.robotTask.behaviours.push(beha);
      }
    });
    this.selectedBehaviour = null;
  }

  selectTaskPriority(id: string) {
    this.selectedTaskPriority = id;
    this.taskPriorities.forEach(taskPriority=>{
      if(taskPriority.id === this.selectedTaskPriority){
        this.robotTask.priority = taskPriority;
      }
    });
    this.selectedTaskPriority = null;
  }

  createOrUpdate() {
    let dateTime = new Date();
    this.robotTask.startTime = dateTime.toLocaleString();
    this.robotTask.status.name = "waiting";
    this.robotTask.userID = this.loggedUserID;
    this.robotTaskService.save(this.robotTask).subscribe(
      result => {
        if (this.robotTaskExist(this.robotTask.id)) {
          this.storeService.robotTaskList[this.storeService.robotTaskList.findIndex(item => item.id == result.id)] = result;
        } else {
          this.storeService.robotTaskList.push(result);
        }
        this.robotTask = new RobotTask(null, null, null, null, null, null, null);
        this.toastr.success("Dodano lub edytowano pomyślnie");
      },
      error => {
        this.toastr.error("Wystąpił bład podczas dodawania lub edycji");
      }
    );
  }

  robotTaskExist(id: string) {
    return this.storeService.robotTaskList.some(item => item.id == id);
  }

  edit(robotTask: RobotTask) {
    Object.assign(this.robotTask, robotTask)
  }

  delete(robotTask: RobotTask) {

    if(robotTask.robot!=null){
      this.robot = robotTask.robot;

      this.robot.status.forEach(status=>{
        if(status.name==="during task"){
          this.robot.status = this.robot.status.filter(status=> status.id !== this.robotStatusDuringTask.id);
          this.robot.status.push(this.robotStatusFree);
        }
      });

      this.robotService.update(this.robot).subscribe(result => {
        if (result.id != null) {
          this.toastr.success('Status robota wykonującego zmieniony');
        } else {
          this.toastr.error('Nie udało się zmienić statusu');
        }
      });
    }

    this.robotTaskService.delete(robotTask).subscribe(
      result => {
        this.storeService.robotTaskList = this.storeService.robotTaskList.filter(item => item != robotTask);
        this.toastr.success("Usunięto pomyślnie");
        this.robotTask = new RobotTask(null, null, null, null, null, null, null);
        this.robot = new Robot(null, null, null, null, null, null, null, null, null);

      },
      error => {
        this.toastr.error("Wystąpił błąd podczas usuwania");
      }
    )


  }

  reset() {
    this.robotTask = new RobotTask(null, null, null, null, null, null, null);
  }

}
