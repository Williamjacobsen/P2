@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping
    public ResponseEntity<String> createCoupon(@RequestBody CouponDto dto) {
        couponService.createCoupon(dto);
        return ResponseEntity.ok("Coupon created");
    }
}