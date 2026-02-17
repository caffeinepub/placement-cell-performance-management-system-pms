import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import Runtime "mo:core/Runtime";
import Nat64 "mo:core/Nat64";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use new data type via migration handler

actor {
  // Types
  public type AssignmentType = {
    #allMembers;
    #specificMembers : [Principal];
  };

  public type GoalStatus = {
    #notStarted;
    #inProgress;
    #completed;
    #onHold;
  };

  public type Goal = {
    id : Nat;
    title : Text;
    description : Text;
    deadline : Time.Time;
    status : GoalStatus;
    progress : Nat;
    createdBy : Principal;
    assignment : AssignmentType;
  };

  public type Competency = {
    id : Nat;
    name : Text;
    description : Text;
    assignment : AssignmentType;
  };

  public type SkillRating = {
    competencyId : Nat;
    rating : Nat;
    user : Principal;
  };

  public type PerformanceReview = {
    id : Nat;
    templateName : Text;
    questions : [Text];
    submittedBy : Principal;
    selfAssessment : [Text];
    managerAssessment : [Text];
    peerAssessment : [Text];
    assignment : AssignmentType;
  };

  public type FeedbackItem = {
    id : Nat;
    from : Principal;
    to : Principal;
    comment : Text;
    timestamp : Time.Time;
    assignment : AssignmentType;
  };

  public type DevelopmentPlan = {
    id : Nat;
    description : Text;
    dueDate : Time.Time;
    status : GoalStatus;
    createdBy : Principal;
    assignment : AssignmentType;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    department : Text;
  };

  module Goal {
    public func compareByDeadline(goal1 : Goal, goal2 : Goal) : Order.Order {
      Nat64.compare(Nat64.fromIntWrap(goal1.deadline), Nat64.fromIntWrap(goal2.deadline));
    };
  };

  // State
  var nextGoalId = 1;
  let budgets = Map.empty<Principal, Nat>();
  let goals = Map.empty<Nat, Goal>();
  let competencies = Map.empty<Nat, Competency>();
  let skillRatings = List.empty<SkillRating>();
  let performanceReviews = Map.empty<Nat, PerformanceReview>();
  let feedback = Map.empty<Nat, FeedbackItem>();
  let developmentPlans = Map.empty<Nat, DevelopmentPlan>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var hasAdminBeenAssigned = false;

  public type BootstrapAdminResult = {
    #success;
    #adminAlreadyExists;
  };

  public shared ({ caller }) func bootstrapAdmin() : async BootstrapAdminResult {
    if (hasAdminBeenAssigned) {
      return #adminAlreadyExists;
    };

    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    hasAdminBeenAssigned := true;

    #success;
  };

  public query ({ caller }) func getCurrentUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  //-------------------------
  // Goal Management
  //-------------------------

  public shared ({ caller }) func createGoal(title : Text, description : Text, deadline : Time.Time, assignment : AssignmentType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create goals");
    };

    let goal : Goal = {
      id = nextGoalId;
      title;
      description;
      deadline;
      status = #notStarted;
      progress = 0;
      createdBy = caller;
      assignment;
    };

    goals.add(nextGoalId, goal);
    nextGoalId += 1;
    goal.id;
  };

  public query ({ caller }) func getGoal(id : Nat) : async ?Goal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };

    switch (goals.get(id)) {
      case (null) { null };
      case (?goal) {
        // Check if user is assigned to this goal
        let isAssigned = switch (goal.assignment) {
          case (#allMembers) { true };
          case (#specificMembers(members)) {
            members.any(func(p) { p == caller });
          };
        };

        if (not isAssigned and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Goal not assigned to you");
        };
        ?goal;
      };
    };
  };

  public query ({ caller }) func listGoals() : async {
    assignedToAll : [Goal];
    assignedToMe : [Goal];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list goals");
    };

    let allGoals = goals.values().toArray();

    let assignedToAll = allGoals.filter(
      func(goal) {
        switch (goal.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allGoals.filter(
      func(goal) {
        switch (goal.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == caller }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  public query ({ caller }) func listUpcomingGoals() : async {
    assignedToAll : [Goal];
    assignedToMe : [Goal];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list goals");
    };

    let allGoals = goals.values().toArray();
    let sortedGoals = allGoals.sort(Goal.compareByDeadline);

    let assignedToAll = sortedGoals.filter(
      func(goal) {
        switch (goal.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = sortedGoals.filter(
      func(goal) {
        switch (goal.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == caller }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  public shared ({ caller }) func updateGoalStatus(id : Nat, status : GoalStatus, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };

    switch (goals.get(id)) {
      case (null) {
        Runtime.trap("Goal not found");
      };
      case (?goal) {
        // Check if user is assigned to this goal
        let isAssigned = switch (goal.assignment) {
          case (#allMembers) { true };
          case (#specificMembers(members)) {
            members.any(func(p) { p == caller });
          };
        };

        if (not isAssigned and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Goal not assigned to you");
        };

        let updatedGoal = {
          id = goal.id;
          title = goal.title;
          description = goal.description;
          deadline = goal.deadline;
          status;
          progress;
          assignment = goal.assignment;
          createdBy = goal.createdBy;
        };
        goals.add(id, updatedGoal);
      };
    };
  };

  //-------------------------
  // Competencies & Skills
  //-------------------------

  public shared ({ caller }) func addCompetency(name : Text, description : Text, assignment : AssignmentType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add competencies");
    };

    let competency : Competency = {
      id = competencies.size();
      name;
      description;
      assignment;
    };

    competencies.add(competency.id, competency);
    competency.id;
  };

  public query ({ caller }) func listCompetencies() : async {
    assignedToAll : [Competency];
    assignedToMe : [Competency];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list competencies");
    };

    let allCompetencies = competencies.values().toArray();

    let assignedToAll = allCompetencies.filter(
      func(competency) {
        switch (competency.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allCompetencies.filter(
      func(competency) {
        switch (competency.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == caller }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  public shared ({ caller }) func rateSkill(competencyId : Nat, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate skills");
    };

    // Verify the competency exists and is assigned to the caller
    switch (competencies.get(competencyId)) {
      case (null) {
        Runtime.trap("Competency not found");
      };
      case (?competency) {
        let isAssigned = switch (competency.assignment) {
          case (#allMembers) { true };
          case (#specificMembers(members)) {
            members.any(func(p) { p == caller });
          };
        };

        if (not isAssigned and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Competency not assigned to you");
        };
      };
    };

    let skillRating : SkillRating = {
      competencyId;
      rating;
      user = caller;
    };

    skillRatings.add(skillRating);
  };

  public query ({ caller }) func getUserSkillRatings(user : Principal) : async [SkillRating] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view skill ratings");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own skill ratings");
    };

    skillRatings.filter(func(r : SkillRating) : Bool { r.user == user }).toArray();
  };

  //-------------------------
  // Performance Reviews
  //-------------------------

  public shared ({ caller }) func submitPerformanceReview(templateName : Text, questions : [Text], selfAssessment : [Text], managerAssessment : [Text], peerAssessment : [Text], assignment : AssignmentType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can submit performance reviews");
    };

    let review : PerformanceReview = {
      id = performanceReviews.size();
      templateName;
      questions;
      submittedBy = caller;
      selfAssessment;
      managerAssessment;
      peerAssessment;
      assignment;
    };

    performanceReviews.add(review.id, review);
    review.id;
  };

  public query ({ caller }) func getPerformanceReview(id : Nat) : async ?PerformanceReview {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view performance reviews");
    };

    switch (performanceReviews.get(id)) {
      case (null) { null };
      case (?review) {
        // Check if user is assigned to this review
        let isAssigned = switch (review.assignment) {
          case (#allMembers) { true };
          case (#specificMembers(members)) {
            members.any(func(p) { p == caller });
          };
        };

        if (not isAssigned and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Review not assigned to you");
        };
        ?review;
      };
    };
  };

  public query ({ caller }) func listPerformanceReviews() : async {
    assignedToAll : [PerformanceReview];
    assignedToMe : [PerformanceReview];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list performance reviews");
    };

    let allReviews = performanceReviews.values().toArray();

    let assignedToAll = allReviews.filter(
      func(review) {
        switch (review.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allReviews.filter(
      func(review) {
        switch (review.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == caller }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  //-------------------------
  // Continuous Feedback
  //-------------------------

  public shared ({ caller }) func addFeedback(to : Principal, comment : Text, assignment : AssignmentType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add feedback");
    };

    let feedbackItem : FeedbackItem = {
      id = feedback.size();
      from = caller;
      to;
      comment;
      timestamp = Time.now();
      assignment;
    };

    feedback.add(feedbackItem.id, feedbackItem);
    feedbackItem.id;
  };

  public query ({ caller }) func getFeedbackForUser(user : Principal) : async {
    assignedToAll : [FeedbackItem];
    assignedToMe : [FeedbackItem];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feedback");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own feedback");
    };

    let allFeedback = feedback.values().toArray().filter(func(f) { f.to == user });

    let assignedToAll = allFeedback.filter(
      func(f) {
        switch (f.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allFeedback.filter(
      func(f) {
        switch (f.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == user }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  public query ({ caller }) func getFeedbackFromUser(user : Principal) : async {
    assignedToAll : [FeedbackItem];
    assignedToMe : [FeedbackItem];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feedback");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own feedback");
    };

    let allFeedback = feedback.values().toArray().filter(func(f) { f.from == user });

    let assignedToAll = allFeedback.filter(
      func(f) {
        switch (f.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allFeedback.filter(
      func(f) {
        switch (f.assignment) {
          case (#specificMembers(members)) { members.any(func(p) { p == caller }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  //-------------------------
  // Development Plans
  //-------------------------

  public shared ({ caller }) func createDevelopmentPlan(description : Text, dueDate : Time.Time, assignment : AssignmentType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create development plans");
    };

    let plan : DevelopmentPlan = {
      id = developmentPlans.size();
      description;
      dueDate;
      status = #notStarted;
      createdBy = caller;
      assignment;
    };

    developmentPlans.add(plan.id, plan);
    plan.id;
  };

  public query ({ caller }) func getDevelopmentPlansForUser(user : Principal) : async {
    assignedToAll : [DevelopmentPlan];
    assignedToMe : [DevelopmentPlan];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view development plans");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own development plans");
    };

    let allPlans = developmentPlans.values().toArray();

    let assignedToAll = allPlans.filter(
      func(p) {
        switch (p.assignment) {
          case (#allMembers) { true };
          case (_) { false };
        };
      }
    );

    let assignedToMe = allPlans.filter(
      func(p) {
        switch (p.assignment) {
          case (#specificMembers(members)) { members.any(func(principal) { principal == user }) };
          case (_) { false };
        };
      }
    );

    { assignedToAll; assignedToMe };
  };

  public shared ({ caller }) func updateDevelopmentPlanStatus(id : Nat, status : GoalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update development plans");
    };

    switch (developmentPlans.get(id)) {
      case (null) {
        Runtime.trap("Development plan not found");
      };
      case (?plan) {
        // Check if user is assigned to this plan
        let isAssigned = switch (plan.assignment) {
          case (#allMembers) { true };
          case (#specificMembers(members)) {
            members.any(func(p) { p == caller });
          };
        };

        if (not isAssigned and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Development plan not assigned to you");
        };

        let updatedPlan = {
          id = plan.id;
          description = plan.description;
          dueDate = plan.dueDate;
          status;
          assignment = plan.assignment;
          createdBy = plan.createdBy;
        };
        developmentPlans.add(id, updatedPlan);
      };
    };
  };
};
