# Intro

In short, Stagync is an event centralizer under data manipulation. That means with him,
You can adjust the same data to various sources and with multiple listeners.

In practice, you can use the program with your application's state controller to ensure that data is always persistent in some repositories, either in memory or in a database.

## Motivation
With javascript we have the advantage of event driven working.
But this can become a problem depending on the complexity of your application.
At some point we come across event-based systems that are
so complex that we give up on maintenance. Part of the blame lies in the chain of listeners and event broadcasters scattered throughout the project archives.

To address this, Stagync helps to centralize these events,
offering a simple and feature-rich api for manipulation and retrieval of data.

With it we try to minimize the complexity of the application, improving the development and maintainability of the project.
