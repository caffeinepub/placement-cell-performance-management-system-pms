import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Competency {
    id: bigint;
    assignment: AssignmentType;
    name: string;
    description: string;
}
export interface SkillRating {
    user: Principal;
    rating: bigint;
    competencyId: bigint;
}
export type Time = bigint;
export interface PerformanceReview {
    id: bigint;
    assignment: AssignmentType;
    peerAssessment: Array<string>;
    selfAssessment: Array<string>;
    submittedBy: Principal;
    templateName: string;
    managerAssessment: Array<string>;
    questions: Array<string>;
}
export interface DevelopmentPlan {
    id: bigint;
    status: GoalStatus;
    assignment: AssignmentType;
    createdBy: Principal;
    dueDate: Time;
    description: string;
}
export type AssignmentType = {
    __kind__: "specificMembers";
    specificMembers: Array<Principal>;
} | {
    __kind__: "allMembers";
    allMembers: null;
};
export interface FeedbackItem {
    id: bigint;
    to: Principal;
    assignment: AssignmentType;
    from: Principal;
    comment: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
    email: string;
    department: string;
}
export interface Goal {
    id: bigint;
    status: GoalStatus;
    title: string;
    assignment: AssignmentType;
    createdBy: Principal;
    description: string;
    deadline: Time;
    progress: bigint;
}
export enum BootstrapAdminResult {
    adminAlreadyExists = "adminAlreadyExists",
    success = "success"
}
export enum GoalStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress",
    onHold = "onHold"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCompetency(name: string, description: string, assignment: AssignmentType): Promise<bigint>;
    addFeedback(to: Principal, comment: string, assignment: AssignmentType): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bootstrapAdmin(): Promise<BootstrapAdminResult>;
    createDevelopmentPlan(description: string, dueDate: Time, assignment: AssignmentType): Promise<bigint>;
    createGoal(title: string, description: string, deadline: Time, assignment: AssignmentType): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUserRole(): Promise<UserRole>;
    getDevelopmentPlansForUser(user: Principal): Promise<{
        assignedToAll: Array<DevelopmentPlan>;
        assignedToMe: Array<DevelopmentPlan>;
    }>;
    getFeedbackForUser(user: Principal): Promise<{
        assignedToAll: Array<FeedbackItem>;
        assignedToMe: Array<FeedbackItem>;
    }>;
    getFeedbackFromUser(user: Principal): Promise<{
        assignedToAll: Array<FeedbackItem>;
        assignedToMe: Array<FeedbackItem>;
    }>;
    getGoal(id: bigint): Promise<Goal | null>;
    getPerformanceReview(id: bigint): Promise<PerformanceReview | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSkillRatings(user: Principal): Promise<Array<SkillRating>>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listCompetencies(): Promise<{
        assignedToAll: Array<Competency>;
        assignedToMe: Array<Competency>;
    }>;
    listGoals(): Promise<{
        assignedToAll: Array<Goal>;
        assignedToMe: Array<Goal>;
    }>;
    listPerformanceReviews(): Promise<{
        assignedToAll: Array<PerformanceReview>;
        assignedToMe: Array<PerformanceReview>;
    }>;
    listUpcomingGoals(): Promise<{
        assignedToAll: Array<Goal>;
        assignedToMe: Array<Goal>;
    }>;
    rateSkill(competencyId: bigint, rating: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPerformanceReview(templateName: string, questions: Array<string>, selfAssessment: Array<string>, managerAssessment: Array<string>, peerAssessment: Array<string>, assignment: AssignmentType): Promise<bigint>;
    updateDevelopmentPlanStatus(id: bigint, status: GoalStatus): Promise<void>;
    updateGoalStatus(id: bigint, status: GoalStatus, progress: bigint): Promise<void>;
}
