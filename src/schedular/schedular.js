
/**
 * 
 * A job schedular that limits the time it can take up
 * in an animationframe by the interval given to it.
 * 
 * This should only be used for jobs that can be dropped if a new
 * one arrives before the old is completed. 
 * 
 * @param {number} interval ms that jobs are sceduled for each animationframe
 * @param {AudioContext} audioContext
 */
export const Schedular = function(interval, audioContext) {
    this.interval =  interval || 16;
    this.jobs = [];
    this.ctx = audioContext;
    
    this.currentJobIndex = 0;
    this.frame = -1; // current animation frame
}

/**
 * Gets the current time
 * 
 * @returns {number}
 */
Schedular.prototype.getTime = function() {
    if(this.ctx) {
        return this.ctx.currentTime;
    } else if(window['performance']) {
        return performance.now();
    } else {
        return Date.now();
    }
}

/**
 * 
 * Returns a handle that can be used to schedule jobs,
 * a single handle should be used for a single repeating task.
 * 
 * @returns {Handle} A scheduling handle
 */
Schedular.prototype.getHandle = function() {
    const handle = new Handle();
    this.jobs.push(handle);

    return handle;
}

/**
 * 
 * Returns an array of handles that can be used to schedule jobs,
 * a single handle should be used for a single repeating task.
 * 
 * @param {number} ammount Ammount of handles you want
 * @returns {Handle[]} An array of scheduling handles
 */
Schedular.prototype.getHandles = function(ammount) {
    var arr = [];
    for(let i = 0; i < ammount; i ++) {
        arr.push(this.getHandle());
    }
    return arr;
}

/**
 * 
 * Sets the scheduling interval
 * 
 * @param {number} interval
 */
Schedular.prototype.setInterval = function(interval) {
    this.interval = interval;
}

/**
 * Call this function to start the schedular
 */
Schedular.prototype.start = function() {
    this.frame = requestAnimationFrame(() => this.start());
    if(this.jobs.length === 0) return;

    const startIndex = this.currentJobIndex;
    const endTime = this.ctx.currentTime + this.interval / 1000;
    while(this.ctx.currentTime <= endTime) {
        const job = this.jobs[this.currentJobIndex];
        if(job.hasJob) job.doJob();

        this.currentJobIndex = ++this.currentJobIndex % this.jobs.length; 
        if(this.currentJobIndex === startIndex) break;
    }
}

/**
 * Call this function to stop the schedular
 */
Schedular.prototype.stop = function() {
    cancelAnimationFrame(this.frame);
}

/**
 * 
 * Handles guarentee the schedular processes jobs
 * in the order they are requested in while removing jobs
 * that have not been completed if addJob is called on the
 * same handle before completion.
 * 
 * @param {{() => void}} job
 * @param {boolean} hasJob
 */
const Handle = function(job, hasJob) {
    this.currentJob = job || null;
    this.hasJob = hasJob || job != null;
}

/**
 * Cancles a job if it has not been done yet by the schedular
 */
Handle.prototype.cancleJob = function() {
    this.hasJob = false;
}

/**
 * Adds a job to the schedular, if the handle had
 * an uncompleted job it will be replaced by the new one
 * 
 * @param {() => void} job
 */
Handle.prototype.addJob = function(job) {
    this.currentJob = job;
    this.hasJob = true;
}

Handle.prototype.doJob = function() {
    this.currentJob();
    this.hasJob = false;
}
