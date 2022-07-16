# digital-signage
This project allows controlling of remote clients browser.

## Slideshows
It is possible to create different slideshows containing slides. 
A slide is built from an URL an da duration how long this URL should be shown.
![slideshows](/docs/slideshows.png)
![slideshow](/docs/slideshow.png)

## Client
Clients are organized in client groups. To assign a client to a group the client needs to open the group specific URL in the browser.
There are different URL parameters which can be applied to identify a client.

| Parameter 	| Description                                                        	|
|-----------	|--------------------------------------------------------------------	|
| group     	| the identifier of the client group                                 	|
| hostname  	| the hostname of the client                                         	|
| cid       	| an individual id for the client                                    	|
| server    	| the address for the websocket server (generally no need to change) 	|
| port      	| the port for the websocket server (generally no need to change)    	|

It is enough to open the URL in a local browser.

Alternatively the electron app in the `client` folder can be used. Here the configuration file `config.example.json` needs to be copied to `config.json`.
Afterwards the parameters can be set in the config file.

When the client group URL is opened the assigned slideshows are shown. The client changes the URL defined in the individual slides after the assigned duration.

The currently active clients can be seen in the backend.
![client1](/docs/client1.png)

When the slideshow is changed the new slideshow needs to be send to the clients of a group.
![client2](/docs/client2.png)
![client3](/docs/client3.png)

