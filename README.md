#Inter-Personal Time

###An Appointment-Making App that uses realtime WebSockets to schedule appointments for the following two user stories:


Marissa

Marissa works at a local non-profit helping where she helps people find jobs in the technology industry. Many of the students want to schedule time with her, but it can be hard sometimes to work around everyone's schedule and whatnot. She decides to use Personal Time to schedule her appointments.

She heads over to the Personal Time website and clicks on the link to create a new schedule.
This generates two unique URLs: one where she can see all of her appointments and one that she can give to people to schedule a time.
She is autoredirected to the first URL, which we'll call the "Admin Dashboard" from this point forward.
On the Admin Dashboard, the application displays an additional URL for her to give out to students. We'll call this the "scheduling page" from this point forward.
She puts in a bunch of time slot into the administration dashboard. Each time slot has the following:
The date in which the time slot occurs.
The start time.
The end time.
A text field for comments or other notes.
She then sends the URL to the scheduling page out to everyone she is working with. (The mechanism for sending out the URL is not part of the application.)
On the scheduling page, if someone selects a time, it becomes disabled for everyone viewing the scheduling page immediately (without a page refresh). This means that it isn't possible to be double booked.
Users can also deselect their current choice if they want to free up that spot while they think about it a little more.
After selecting a slot, the student scheduling a meeting with Marisa sees that they can add it to their calendar, either by downloading an iCal file or adding it directly to a Google Calendar.
The iCal file format is just a text file with a particular structure and format. You might consider using a library.
Later on, she finds out that her friend Tan is trying to schedule lunch with a bunch of people. She notices that lunch overlaps with some of her appointment slots. She heads over the administration view and notices that she can delete open time slots, but she cannot delete time slots that have been scheduled.
Mary

Mary mentors up and coming software engineers because of the deep joy generates in her heart. As much as she loves working with junior developers, she is on the East Coast and many of the people she works with live in Mountain Time. Mary, being comfortable with technology, decides to offload this task to a computer rather than dealing with it herself. Mary has many of the same needs as Marissa, with some additional requirements:

She heads over to the Personal Time website and creates a bunch of slots. She notices that the site already knew she was on Eastern Time. She puts in a number of time slots.
She sends the link out to her proteges.
When they visit the page, they all of the dates and times in their current time zones as well, so there is no confusion about when they're meeting.
