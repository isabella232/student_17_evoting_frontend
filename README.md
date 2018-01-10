# Evoting EPFL - Frontend and authentication

## Presentation

The EPFL is the theater of a lot of elections, some of them are lacking of participants, their
unavailability being caused by distance or planning conflicts.
Inspired by an already existing voting system, Helios, we present the new online voting
system, also called evoting, specific to the EPFL. It enables those previously unavailable voters
to let their voices heard wherever they are and on a longer period of time by providing a simple
voting interface, easily accessible and providing privacy, integrity as well as authenticity.
This project is developed in parallel of a master thesis, focusing on the implementation of the
encryption and shuffle algorithms on the cothority and its skipchain while in this paper our aim
is to explain the behavior and the security of both the authentication server and the frontend
with which the user will interact.

## Installation

Get the github’s repository by typing :
```
git clone https://github.com/dedis/student_17_evoting_frontend
cd student_evoting/E_Voting_EPFL
```
The rest of the setup will assume that you are in the folder E Voting EPFL.

### Authentication server

Be aware that the authentication server can only be launched when connected to the EPFL
Wi-Fi or using the EPFL VPN.
```
cd authentication_server
node server.js
```
The console indicates : Server listening on port 3000 when the server is ready to be used.
To stop the server, CTRL-C.

### Launch cothority

This part requires the project student 17 evoting from the dedis’ Github repository developped in parallel to this project.
```
go get -u github.com/dedis/student_17_evoting
git clone https://github.com/dedis/student_17_evoting
cd student_17_evoting
go test -v ./..
### Creation of the master skipchain
‘‘‘ cmd
./setup.sh run 5 3
cd cli
go run cli.go -roster=../public.toml
# Create the master Skipchain.
# Key has to be in base 64 representation.
# Admins has to be listed of comma-separated numbers, i.e 100, 200, 300
go run cli.go -pin=[pin] -roster=../public.toml -key=[frontend key] -admins=[list of
admins]
# If the creation was successful the identifier of the master Skipchain is returned.
```
You have to recover the identifier if the master Skipchain and copy it in the config/config.ini
file in the constant masterPin.

### Frontend

The frontends are in the file client/html.
For the administrator frontend, launch web admin.html with your preferred browser.
For the user frontend, launch web user.html with your preferred browser.


