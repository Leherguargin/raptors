package pl.raptors.raptorsRobotsApp.service.movement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.raptors.raptorsRobotsApp.domain.movement.Corridor;
import pl.raptors.raptorsRobotsApp.domain.movement.MovementPath;
import pl.raptors.raptorsRobotsApp.domain.movement.Route;
import pl.raptors.raptorsRobotsApp.repository.movement.MovementPathRepository;
import pl.raptors.raptorsRobotsApp.service.CRUDService;

import java.util.List;

//@PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SERVICEMAN')")
@Service
public class MovementPathService implements CRUDService<MovementPath> {

    @Autowired
    MovementPathRepository movementPathRepository;
    @Autowired
    CorridorService corridorService;
    @Autowired
    RouteService routeService;

    @Override
    public MovementPath addOne(MovementPath movementPath) {
        return movementPathRepository.save(movementPath);
    }

    @Override
    public MovementPath getOne(String id) {
        return movementPathRepository.findById(id).orElse(null);
    }

    @Override
    public List<MovementPath> getAll() {
        return movementPathRepository.findAll();
    }

    @Override
    public MovementPath updateOne(MovementPath movementPath) {
        List<Corridor> corridorList = corridorService.getCorridorsByMovementPath(this.getOne(movementPath.getId()));
        List<Route> routeList = routeService.getByPath(this.getOne(movementPath.getId()));
        for (Corridor corridor : corridorList) {
            corridor.setMovementPathId(movementPath.getId());
            corridorService.updateOne(corridor);
        }

        for (Route route : routeList) {
            route.setMovementPathId(movementPath.getId());
            routeService.updateOne(route);
        }
        return movementPathRepository.save(movementPath);
    }

    @Override
    public void deleteOne(MovementPath movementPath) {
        movementPathRepository.delete(movementPath);
    }

    public void deleteById(String id){
        movementPathRepository.deleteById(id);
    }
}
